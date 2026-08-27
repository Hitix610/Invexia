import {supabase} from '../config/supabase.js'

export const getBudgetsService = async (usuario_id) => {
    const {data, error} = await supabase
        .from("presupuestos")
        .select("*")
        .eq("usuario_id", usuario_id)
    
    if (error) {
        throw new Error(error.message)
    }

    return data 
}

//create a new budget

export const createBudgetService = async ({
  usuario_id,
  categoria_id,
  monto_limite,
  mes,
  anio
}) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .insert([
      {
        usuario_id,
        categoria_id,
        monto_limite,
        mes,
        anio
      }
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// update a budget

export const updateBudgetService = async (id, usuario_id, updates) => {
  const { data, error } = await supabase
    .from('presupuestos')
    .update(updates)
    .eq('id', id)
    .eq('usuario_id', usuario_id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// delete a budget

export const deleteBudgetService = async (id, usuario_id) => {
  const { error } = await supabase
    .from('presupuestos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', usuario_id)

  if (error) {
    throw new Error(error.message)
  }

  return { message: 'Presupuesto eliminado correctamente' }
}

export const calcularGastadoService = async (usuario_id, categoria_id, mes, anio) => {

  const { data, error } = await supabase
    .from('transacciones')
    .select('monto')
    .eq('usuario_id', usuario_id)
    .eq('categoria_id', categoria_id)
    .eq('tipo', 'gasto')
    .gte('fecha', `${anio}-${String(mes).padStart(2, '0')}-01`)
    .lte('fecha', `${anio}-${String(mes).padStart(2, '0')}-31`)

  if (error) {
    throw new Error(error.message)
  }

  const total = data.reduce((sum, t) => sum + Number(t.monto), 0)

  return total
}

