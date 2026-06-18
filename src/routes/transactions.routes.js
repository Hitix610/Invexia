/*routes/transactions.routes.js*/

// Rutas para transacciones
import { Router } from 'express'

// controllers
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactions.controller.js'

// services
const router = Router()

// GET all transactions
router.get('/', getTransactions)

// POST a new transaction
router.post('/', createTransaction)

// PUT update a transaction
router.put('/:id', updateTransaction)

// DELETE a transaction
router.delete('/:id', deleteTransaction)

export default router


import { validateTransaction } from '../middleware/validateTransaction.js'

router.post('/', validateTransaction, createTransaction)

