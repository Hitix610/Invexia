import { supabase } from '../config/supabase.js'

// ==========================================
// GET - Obtener todas las metas
// ==========================================
export const getGoalsService = async (usuario_id) => {

  const { data, error } = await supabase
    .from('metas_ahorro')
    .select('*')
    .eq('usuario_id', usuario_id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ==========================================
// POST - Crear una meta
// ==========================================
export const createGoalService = async (goal, usuario_id) => {

  const { data, error } = await supabase
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

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ==========================================
// PUT - Actualizar una meta
// ==========================================
export const updateGoalService = async (id, usuario_id, updates) => {

  const { data, error } = await supabase
    .from('metas_ahorro')
    .update(updates)
    .eq('id', id)
    .eq('usuario_id', usuario_id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
export const deleteGoalService = async (id, usuario_id) => {

  const { error } = await supabase
    .from('metas_ahorro')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario_id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    message: 'Meta eliminada correctamente'
  }
}

// ==========================================
// POST - Crear un aporte a una meta
// ==========================================
export const createGoalContributionService = async (
  meta_id,
  usuario_id,
  monto,
  nota
) => {

  const { data, error } = await supabase
    .from('aportes_metas')
    .insert([
      {
        meta_id,
        usuario_id,
        monto,
        nota: nota || null,
        fecha: new Date().toISOString().split('T')[0]
      }
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}


// ==========================================
// GET - Obtener aportes de una meta
// ==========================================
export const getGoalContributionsService = async (
  meta_id,
  usuario_id
) => {

  const { data, error } = await supabase
    .from('aportes_metas')
    .select('*')
    .eq('meta_id', meta_id)
    .eq('usuario_id', usuario_id)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}