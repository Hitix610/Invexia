/*routes/transactions.routes.js*/
import express from 'express'
import { getTransactions } from '../controllers/transactions.controller.js'

const router = express.Router()

router.get('/', getTransactions)

export default router

/*------------------------------------------------------------------------------*/

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

/*services/transactions.service.js*/
export const getTransactionsService = async () => {
  return [
    { id: 1, amount: 50000, type: 'gasto' },
    { id: 2, amount: 200000, type: 'ingreso' }
  ]
}

/*------------------------------------------------------------------------------*/

/*CONECTAR EN server.js*/
import transactionsRoutes from './routes/transactions.routes.js'

app.use('/transactions', transactionsRoutes)