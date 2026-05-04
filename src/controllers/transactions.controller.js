/*controllers/transactions.controller.js*/
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