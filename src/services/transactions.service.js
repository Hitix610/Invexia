/*services/transactions.service.js*/
/*get all transactions*/
import { supabase } from '../config/supabase.js'

// GET
export const getTransactionsService = async (usuario_id) => {
  const { data, error } = await supabase
  .from('transacciones')
  .select('*')
  .eq('usuario_id', usuario_id)

  if (error) {
    throw new Error(error.message)
  }

  return data
}


/*------------------------------------------------------------------------------*/

/*services/transactions.service.js*/
/*post a new transaction*/
// POST
export const createTransactionService = async ({amount,type,usuario_id}) => {
  console.log("Entrando al servicio...")

  const { data, error } = await supabase
    .from('transacciones')
    .insert([
      {
        usuario_id,
        monto: amount,
        tipo: type,
        fecha: new Date()
      }
    ])
    .select()

  console.log("Respuesta Supabase:", data)

  if (error) {
    console.log("Error Supabase:", error)
    throw new Error(error.message)
  }

  return data
}

/*------------------------------------------------------------------------------*/

/*services/transactions.service.js*/
/*update a transaction*/
// PUt 

export const updateTransactionService = async (id, updates) => {
  const {data,error} = await supabase
    .from('transacciones')
    .update(updates)
    .eq('id', id)
    .select()

    if (error) throw new Error(error.message)

      return data
}

/*------------------------------------------------------------------------------*/

/*services/transactions.service.js*/
/*delete a transaction*/
// DELETE

export const deleteTransactionService = async (id) => {
  const {data,error} = await supabase
    .from('transacciones')
    .delete()
    .eq('id', id)

    if (error) throw new Error(error.message)

      return {message: 'Transacción eliminada exitosamente'}
}

// Obtener transacciones ordenadas por fecha
export const getTransactionsHistoryService = async (usuario_id) => {

  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .eq('usuario_id', usuario_id)
    .order('fecha', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/*------------------------------------------------------------------------------*/