/*controllers/transactions.controller.js*/
/*get all transactions*/
import { getTransactionsService } from '../services/transactions.service.js'

export const getTransactions = async (req, res) => {
  try {
    const data = await getTransactionsService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/*------------------------------------------------------------------------------*/

/*controllers/transactions.controller.js*/
/*post a new transaction*/
import { createTransactionService } from '../services/transactions.service.js'

export const createTransaction = async (req, res) => {
  try {
    console.log(req.body)

    const { amount, type } = req.body

    const data = await createTransactionService({ amount, type })

    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/*------------------------------------------------------------------------------*/


import {
  updateTransactionService,
  deleteTransactionService
} from '../services/transactions.service.js'


//update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, type } = req.body

    const data = await updateTransactionService(id, { 
      monto: amount,
      tipo: type 
    })

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.mesage})
  }
}

/*------------------------------------------------------------------------------*/  


//delete a transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const data = await deleteTransactionService(id)

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

