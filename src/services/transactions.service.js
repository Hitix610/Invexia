/*services/transactions.service.js*/
/*get all transactions*/
import { supabase } from '../config/supabase.js'

// GET
export const getTransactionsService = async () => {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')

  if (error) {
    throw new Error(error.message)
  }

  return data
}


/*------------------------------------------------------------------------------*/

/*services/transactions.service.js*/
/*post a new transaction*/
// POST
export const createTransactionService = async ({ amount, type }) => {
  const usuario_id = "9f0c0b7c-0ed9-4c68-b30f-2f697b6730f1"

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

  if (error) throw new Error(error.message)

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

/*------------------------------------------------------------------------------*/