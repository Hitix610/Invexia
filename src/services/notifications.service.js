import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'

// Crea una notificación. Respeta perfiles.notificaciones_activas.
export const createNotificationService = async ({
  usuario_id,
  titulo,
  mensaje,
  tipo = 'sistema',
  data = null
}) => {
  const perfil = must(
    await supabase
      .from('perfiles')
      .select('notificaciones_activas')
      .eq('id', usuario_id)
      .maybeSingle()
  )

  if (perfil && perfil.notificaciones_activas === false) {
    return null
  }

  const rows = must(
    await supabase
      .from('notificaciones')
      .insert([{ usuario_id, titulo, mensaje, tipo, data }])
      .select()
  )

  return rows[0]
}

// Igual que la anterior pero nunca lanza error: para usar dentro de otros
// flujos (alertas, aportes, XP) sin que una notificación fallida rompa la operación.
export const notifySafe = async (payload) => {
  try {
    return await createNotificationService(payload)
  } catch (error) {
    console.error('NOTIFICATION ERROR:', error.message)
    return null
  }
}

// Lista las notificaciones más recientes del usuario, con filtro opcional por estado de lectura.
export const getNotificationsService = async (usuario_id, { leida, limit = 50 } = {}) => {
  let query = supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('creado_en', { ascending: false })
    .limit(limit)

  if (leida !== undefined) {
    query = query.eq('leida', leida)
  }

  return must(await query)
}

// Cuenta las notificaciones pendientes de leer sin descargar sus filas.
export const countUnreadNotificationsService = async (usuario_id) => {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuario_id)
    .eq('leida', false)

  if (error) throw new Error(error.message)

  return { count: count ?? 0 }
}

// Marca una notificación del usuario como leída y devuelve la fila actualizada.
export const markNotificationReadService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select()
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Notificación no encontrada')
  }

  return rows[0]
}

// Marca todas las notificaciones pendientes del usuario y devuelve cuántas se actualizaron.
export const markAllNotificationsReadService = async (usuario_id) => {
  const rows = must(
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('usuario_id', usuario_id)
      .eq('leida', false)
      .select('id')
  )

  return { message: 'Notificaciones marcadas como leídas', actualizadas: rows.length }
}

// Elimina una notificación del usuario y devuelve 404 si no la encuentra.
export const deleteNotificationService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Notificación no encontrada')
  }

  return { message: 'Notificación eliminada correctamente' }
}
