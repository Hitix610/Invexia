/*routes/transactions.routes.js*/
/*get all transactions*/
import express from 'express'
import { getTransactions } from '../controllers/transactions.controller.js'

const router = express.Router()

router.get('/', getTransactions)

export default router
/*------------------------------------------------------------------------------*/

/*controllers/transactions.controller.js*/
/*post a new transaction*/
import { createTransaction } from '../controllers/transactions.controller.js'

router.post('/', createTransaction)
