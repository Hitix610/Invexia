import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'

// Lista los recordatorios del usuario por orden de creación.
export const getRemindersService = async (usuario_id) =>
  must(
    await supabase
      .from('recordatorios')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('creado_en', { ascending: true })
  )

// Guarda un recordatorio con la programación recibida y lo activa por defecto.
export const createReminderService = async (usuario_id, { tipo, hora, dias_semana, activo }) => {
  const rows = must(
    await supabase
      .from('recordatorios')
      .insert([
        {
          usuario_id,
          tipo,
          hora: hora ?? null,
          dias_semana: dias_semana ?? null,
          activo: activo ?? true
        }
      ])
      .select()
  )

  return rows[0]
}

// Actualiza los campos enviados de un recordatorio del usuario y devuelve la fila modificada.
export const updateReminderService = async (id, usuario_id, updates) => {
  const rows = must(
    await supabase
      .from('recordatorios')
      .update(updates)
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select()
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Recordatorio no encontrado')
  }

  return rows[0]
}

// Elimina un recordatorio del usuario y devuelve 404 si no lo encuentra.
export const deleteReminderService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('recordatorios')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Recordatorio no encontrado')
  }

  return { message: 'Recordatorio eliminado correctamente' }
}
