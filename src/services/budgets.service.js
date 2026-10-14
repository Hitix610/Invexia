import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'
import { rangoMes, mesActualBogota } from '../lib/dates.js'
import { assertCategoriaAccesible } from './categories.service.js'
import { notifySafe } from './notifications.service.js'

const SELECT_CON_CATEGORIA = '*, categorias(nombre, icono, color)'

// ==========================================
// GET - Presupuestos del usuario (filtro opcional por mes/año)
// ==========================================
export const getBudgetsService = async (usuario_id, { mes, anio } = {}) => {
  let query = supabase
    .from('presupuestos')
    .select(SELECT_CON_CATEGORIA)
    .eq('usuario_id', usuario_id)

  if (mes !== undefined) query = query.eq('mes', mes)
  if (anio !== undefined) query = query.eq('anio', anio)

  return must(await query)
}

// ==========================================
// POST - Crear presupuesto
// ==========================================
export const createBudgetService = async ({
  usuario_id,
  categoria_id,
  monto_limite,
  mes,
  anio
}) => {
  await assertCategoriaAccesible(categoria_id, usuario_id)

  const { data, error } = await supabase
    .from('presupuestos')
    .insert([{ usuario_id, categoria_id, monto_limite, mes, anio }])
    .select()

  if (error) {
    // UNIQUE(usuario_id, categoria_id, mes, anio)
    if (error.code === '23505') {
      throw new HttpError(409, 'Ya existe un presupuesto para esa categoría en ese mes')
    }
    throw new Error(error.message)
  }

  return data
}

// ==========================================
// PUT - Actualizar presupuesto
// Si cambia el límite, se reinician las alertas (el 80% del nuevo límite es otro valor)
// ==========================================
export const updateBudgetService = async (id, usuario_id, updates) => {
  if (updates.categoria_id) {
    await assertCategoriaAccesible(updates.categoria_id, usuario_id)
  }

  const cambios = { ...updates }

  if (updates.monto_limite !== undefined) {
    cambios.alerta_80_enviada = false
    cambios.alerta_100_enviada = false
  }

  const { data, error } = await supabase
    .from('presupuestos')
    .update(cambios)
    .eq('id', id)
    .eq('usuario_id', usuario_id)
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Ya existe un presupuesto para esa categoría en ese mes')
    }
    throw new Error(error.message)
  }

  if (data.length === 0) {
    throw new HttpError(404, 'Presupuesto no encontrado')
  }

  return data
}

// ==========================================
// DELETE - Eliminar presupuesto
// ==========================================
export const deleteBudgetService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('presupuestos')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Presupuesto no encontrado')
  }

  return { message: 'Presupuesto eliminado correctamente' }
}

// ==========================================
// Cuánto se ha gastado en una categoría durante un mes
// ==========================================
export const calcularGastadoService = async (usuario_id, categoria_id, mes, anio) => {
  // Rango [día 1, día 1 del mes siguiente): sirve para meses de 28, 30 y 31 días
  const { desde, hasta } = rangoMes(mes, anio)

  const data = must(
    await supabase
      .from('transacciones')
      .select('monto')
      .eq('usuario_id', usuario_id)
      .eq('categoria_id', categoria_id)
      .eq('tipo', 'gasto')
      .gte('fecha', desde)
      .lt('fecha', hasta)
  )

  return data.reduce((sum, t) => sum + Number(t.monto), 0)
}

// Estado según el porcentaje usado: ok < 80 <= advertencia < 100 <= excedido
export const estadoPresupuesto = (porcentaje) => {
  if (porcentaje >= 100) return 'excedido'
  if (porcentaje >= 80) return 'advertencia'
  return 'ok'
}

const formatoCOP = (n) => Number(n).toLocaleString('es-CO')

// ==========================================
// Revisa si un gasto hizo cruzar el 80% o el 100% del presupuesto.
// Marca el flag solo la primera vez y crea la notificación correspondiente.
// ==========================================
export const verificarAlertaPresupuestoService = async (usuario_id, categoria_id, mes, anio) => {
  const presupuesto = must(
    await supabase
      .from('presupuestos')
      .select('*')
      .eq('usuario_id', usuario_id)
      .eq('categoria_id', categoria_id)
      .eq('mes', mes)
      .eq('anio', anio)
      .maybeSingle()
  )

  // Sin presupuesto para esa categoría/mes no hay nada que alertar
  if (!presupuesto) {
    return null
  }

  const gastado = await calcularGastadoService(usuario_id, categoria_id, mes, anio)
  const porcentaje = (gastado / Number(presupuesto.monto_limite)) * 100

  const updates = {}
  let nivel_alerta = null

  if (porcentaje >= 100 && !presupuesto.alerta_100_enviada) {
    updates.alerta_100_enviada = true
    if (!presupuesto.alerta_80_enviada) updates.alerta_80_enviada = true
    nivel_alerta = 100
  } else if (porcentaje >= 80 && porcentaje < 100 && !presupuesto.alerta_80_enviada) {
    updates.alerta_80_enviada = true
    nivel_alerta = 80
  }

  if (nivel_alerta) {
    must(
      await supabase.from('presupuestos').update(updates).eq('id', presupuesto.id)
    )

    const categoria = must(
      await supabase.from('categorias').select('nombre').eq('id', categoria_id).maybeSingle()
    )
    const nombreCategoria = categoria?.nombre ?? 'Categoría'

    await notifySafe({
      usuario_id,
      tipo: 'presupuesto',
      titulo: nivel_alerta === 100 ? 'Presupuesto excedido' : 'Advertencia de presupuesto',
      mensaje:
        nivel_alerta === 100
          ? `${nombreCategoria}: superaste el límite de $${formatoCOP(presupuesto.monto_limite)} este mes.`
          : `${nombreCategoria}: llevas el ${Math.round(porcentaje)}% de tu presupuesto mensual.`,
      data: {
        presupuesto_id: presupuesto.id,
        categoria_id,
        porcentaje: Math.round(porcentaje),
        gastado
      }
    })
  }

  return {
    presupuesto_id: presupuesto.id,
    gastado,
    monto_limite: presupuesto.monto_limite,
    porcentaje: Math.round(porcentaje),
    nivel_alerta,
    alertas: updates
  }
}

// ==========================================
// GET - Presupuestos del mes con lo gastado, porcentaje y estado
// (alimenta la pantalla "Presupuestos" de la app)
// ==========================================
export const getBudgetsStatusService = async (usuario_id, { mes, anio } = {}) => {
  const actual = mesActualBogota()
  const mesFinal = mes ?? actual.mes
  const anioFinal = anio ?? actual.anio

  const presupuestos = await getBudgetsService(usuario_id, { mes: mesFinal, anio: anioFinal })

  const { desde, hasta } = rangoMes(mesFinal, anioFinal)

  const gastos = must(
    await supabase
      .from('transacciones')
      .select('categoria_id, monto')
      .eq('usuario_id', usuario_id)
      .eq('tipo', 'gasto')
      .gte('fecha', desde)
      .lt('fecha', hasta)
  )

  const gastadoPorCategoria = {}
  for (const g of gastos) {
    gastadoPorCategoria[g.categoria_id] = (gastadoPorCategoria[g.categoria_id] || 0) + Number(g.monto)
  }

  return presupuestos.map((p) => {
    const gastado = gastadoPorCategoria[p.categoria_id] || 0
    const porcentaje = Math.round((gastado / Number(p.monto_limite)) * 100)

    return {
      ...p,
      gastado,
      disponible: Number(p.monto_limite) - gastado,
      porcentaje,
      estado: estadoPresupuesto(porcentaje)
    }
  })
}
