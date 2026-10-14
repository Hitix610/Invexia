import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'

export const getProfileService = async (usuario_id) => {
  const perfil = must(
    await supabase
      .from('perfiles')
      .select('*')
      .eq('id', usuario_id)
      .maybeSingle()
  )

  if (!perfil) {
    throw new HttpError(404, 'Perfil no encontrado')
  }

  return perfil
}

export const updateProfileService = async (usuario_id, updates) => {
  const rows = must(
    await supabase
      .from('perfiles')
      .update({ ...updates, actualizado_en: new Date().toISOString() })
      .eq('id', usuario_id)
      .select()
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Perfil no encontrado')
  }

  return rows[0]
}
