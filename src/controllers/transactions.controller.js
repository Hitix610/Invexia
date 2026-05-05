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
    const { amount, type } = req.body

    const newTransaction = await createTransactionService({ amount, type })

    res.status(201).json(newTransaction)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
