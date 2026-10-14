/*services/transactions.service.js*/
import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'
import { hoyBogota } from '../lib/dates.js'
import { assertCategoriaAccesible } from './categories.service.js'

// Incluye nombre/icono/color de la categoría para que Flutter no tenga que cruzar datos
const SELECT_CON_CATEGORIA = '*, categorias(nombre, icono, color)'

// ======================================================
// GET - Transacciones del usuario (con filtros opcionales)
// filters: tipo, categoria_id, fuente, desde, hasta (YYYY-MM-DD), limit
// Sin filtros se comporta como antes (todas las del usuario).
// ======================================================
export const getTransactionsService = async (usuario_id, filters = {}) => {
  let query = supabase
    .from('transacciones')
    .select(SELECT_CON_CATEGORIA)
    .eq('usuario_id', usuario_id)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })

  if (filters.tipo) query = query.eq('tipo', filters.tipo)
  if (filters.categoria_id) query = query.eq('categoria_id', filters.categoria_id)
  if (filters.fuente) query = query.eq('fuente', filters.fuente)
  if (filters.desde) query = query.gte('fecha', filters.desde)
  if (filters.hasta) query = query.lte('fecha', filters.hasta)
  if (filters.limit) query = query.limit(filters.limit)

  return must(await query)
}

// Historial: transacciones ordenadas por fecha descendente
export const getTransactionsHistoryService = async (usuario_id) =>
  getTransactionsService(usuario_id)

// ======================================================
// POST - Crear una transacción manual
// ======================================================
export const createTransactionService = async ({
  amount,
  type,
  categoria_id,
  descripcion,
  comercio,
  fecha,
  notas,
  cuenta_id,
  usuario_id
}) => {
  if (categoria_id) {
    await assertCategoriaAccesible(categoria_id, usuario_id)
  }

  if (cuenta_id) {
    await assertCuentaPropia(cuenta_id, usuario_id)
  }

  return must(
    await supabase
      .from('transacciones')
      .insert([
        {
          usuario_id,
          categoria_id: categoria_id || null,
          cuenta_id: cuenta_id || null,
          monto: Number(amount),
          tipo: type,
          descripcion: descripcion ?? null,
          comercio: comercio ?? null,
          notas: notas ?? null,
          fecha: fecha || hoyBogota(),
          fuente: 'manual'
        }
      ])
      .select()
  )
}

// ======================================================
// PUT - Actualizar una transacción (solo del usuario)
// ======================================================
const CAMPOS_BANCARIOS_BLOQUEADOS = ['monto', 'tipo', 'fecha', 'cuenta_id']

export const updateTransactionService = async (id, usuario_id, updates) => {
  const actual = must(
    await supabase
      .from('transacciones')
      .select('id, fuente')
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .maybeSingle()
  )

  if (!actual) {
    throw new HttpError(404, 'Transacción no encontrada')
  }

  // Los datos que vienen del banco no se editan (RF-21: solo se corrige la categoría)
  if (actual.fuente === 'belvo') {
    const prohibidos = CAMPOS_BANCARIOS_BLOQUEADOS.filter((c) => updates[c] !== undefined)

    if (prohibidos.length > 0) {
      throw new HttpError(
        403,
        'En una transacción bancaria solo se puede cambiar categoría, descripción y notas'
      )
    }
  }

  if (updates.categoria_id) {
    await assertCategoriaAccesible(updates.categoria_id, usuario_id)
  }

  if (updates.cuenta_id) {
    await assertCuentaPropia(updates.cuenta_id, usuario_id)
  }

  const rows = must(
    await supabase
      .from('transacciones')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select()
  )

  return rows
}

// ======================================================
// DELETE - Eliminar una transacción (solo del usuario)
// ======================================================
export const deleteTransactionService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('transacciones')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Transacción no encontrada')
  }

  return { message: 'Transacción eliminada exitosamente' }
}

// Verifica que la cuenta bancaria pertenezca al usuario
const assertCuentaPropia = async (cuenta_id, usuario_id) => {
  const fila = must(
    await supabase
      .from('cuentas_bancarias')
      .select('id')
      .eq('id', cuenta_id)
      .eq('usuario_id', usuario_id)
      .maybeSingle()
  )

  if (!fila) {
    throw new HttpError(400, 'cuenta_id no existe o no pertenece a este usuario')
  }
}
