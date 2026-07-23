// Importar la conexión con Supabase
import { supabase } from '../config/supabase.js'

// Usuario temporal de pruebas
const usuario_id = '9f0c0b7c-0ed9-4c68-b30f-2f697b6730f1'

// ==========================================
// GET - Obtener todas las metas
// ==========================================
export const getGoalsService = async () => {

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
export const createGoalService = async (goal) => {

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
export const updateGoalService = async (id, updates) => {

  const { data, error } = await supabase
    .from('metas_ahorro')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
export const deleteGoalService = async (id) => {

  const { error } = await supabase
    .from('metas_ahorro')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return {
    message: 'Meta eliminada correctamente'
  }
}