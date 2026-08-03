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

