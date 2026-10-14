import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'
import { notifySafe } from './notifications.service.js'

const porcentajeMeta = (meta) => {
  const objetivo = Number(meta.monto_objetivo)
  if (!objetivo) return 0
  return Math.min(100, Math.round((Number(meta.monto_actual || 0) / objetivo) * 100))
}

// Devuelve la meta solo si es del usuario; si no, 404
const getOwnedGoal = async (meta_id, usuario_id) => {
  const meta = must(
    await supabase
      .from('metas_ahorro')
      .select('*')
      .eq('id', meta_id)
      .eq('usuario_id', usuario_id)
      .maybeSingle()
  )

  if (!meta) {
    throw new HttpError(404, 'Meta no encontrada')
  }

  return meta
}

// ==========================================
// GET - Obtener todas las metas (con porcentaje de avance)
// ==========================================
export const getGoalsService = async (usuario_id) => {
  const data = must(
    await supabase
      .from('metas_ahorro')
      .select('*')
      .eq('usuario_id', usuario_id)
  )

  return data.map((meta) => ({ ...meta, porcentaje: porcentajeMeta(meta) }))
}

// ==========================================
// POST - Crear una meta
// ==========================================
export const createGoalService = async (goal, usuario_id) => {
  return must(
    await supabase
      .from('metas_ahorro')
      .insert([
        {
          usuario_id,
          nombre: goal.nombre,
          descripcion: goal.descripcion,
          monto_objetivo: goal.monto_objetivo,
          fecha_limite: goal.fecha_limite
        }
      ])
      .select()
  )
}

// ==========================================
// PUT - Actualizar una meta
// ==========================================
export const updateGoalService = async (id, usuario_id, updates) => {
  const data = must(
    await supabase
      .from('metas_ahorro')
      .update(updates)
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select()
  )

  if (data.length === 0) {
    throw new HttpError(404, 'Meta no encontrada')
  }

  return data
}

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
export const deleteGoalService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('metas_ahorro')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Meta no encontrada')
  }

  return { message: 'Meta eliminada correctamente' }
}

// Umbrales de avance que generan notificación (RF-31)
export const HITOS_META = [50, 80, 100]

// Devuelve el mayor hito que se cruzó al pasar de `antes` a `despues` (porcentajes), o null
export const hitoCruzado = (antes, despues) => {
  const cruzados = HITOS_META.filter((h) => antes < h && despues >= h)
  return cruzados.length ? Math.max(...cruzados) : null
}

// ==========================================
// POST - Crear un aporte a una meta
// El trigger on_aporte_meta recalcula monto_actual y el estado de la meta.
// ==========================================
export const createGoalContributionService = async (meta_id, usuario_id, monto, nota) => {
  // Antes se podía aportar a la meta de otro usuario conociendo su id
  const meta = await getOwnedGoal(meta_id, usuario_id)

  if (['completada', 'cancelada', 'pausada'].includes(meta.estado)) {
    throw new HttpError(400, `La meta está ${meta.estado}: no admite nuevos aportes`)
  }

  const data = must(
    await supabase
      .from('aportes_metas')
      .insert([
        {
          meta_id,
          usuario_id,
          monto,
          nota: nota || null,
          fecha: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
        }
      ])
      .select()
  )

  // Notificación al cruzar 50% / 80% / 100% (no rompe el aporte si falla)
  try {
    const despues = await getOwnedGoal(meta_id, usuario_id)
    const montoActual = Number(despues.monto_actual || 0)

    if (montoActual >= Number(monto)) {
      const objetivo = Number(despues.monto_objetivo)
      const pctDespues = (montoActual / objetivo) * 100
      const pctAntes = ((montoActual - Number(monto)) / objetivo) * 100
      const hito = hitoCruzado(pctAntes, pctDespues)

      if (hito) {
        await notifySafe({
          usuario_id,
          tipo: 'meta',
          titulo: hito === 100 ? '¡Meta completada!' : 'Avance en tu meta',
          mensaje:
            hito === 100
              ? `Alcanzaste tu meta: ${despues.nombre}. ¡Felicitaciones!`
              : `Tu meta "${despues.nombre}" ya va en el ${hito}%.`,
          data: { meta_id, porcentaje: hito }
        })
      }
    }
  } catch (error) {
    console.error('GOAL NOTIFICATION ERROR:', error.message)
  }

  return data
}

// ==========================================
// GET - Obtener aportes de una meta
// ==========================================
export const getGoalContributionsService = async (meta_id, usuario_id) => {
  await getOwnedGoal(meta_id, usuario_id)

  return must(
    await supabase
      .from('aportes_metas')
      .select('*')
      .eq('meta_id', meta_id)
      .eq('usuario_id', usuario_id)
      .order('fecha', { ascending: false })
  )
}
