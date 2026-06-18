/*routes/transactions.routes.js*/

// Importar Router de Express
import { Router } from 'express'

// Importar controladores
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsHistory
} from '../controllers/transactions.controller.js'

// Crear instancia del router
const router = Router()

// GET todas las transacciones
router.get('/', getTransactions)

// 👇 Ruta del historial
router.get('/history', getTransactionsHistory)

// POST nueva transacción
router.post('/', createTransaction)

// PUT actualizar transacción
router.put('/:id', updateTransaction)

// DELETE eliminar transacción
router.delete('/:id', deleteTransaction)

<<<<<<< HEAD
export default router


import { validateTransaction } from '../middleware/validateTransaction.js'

router.post('/', validateTransaction, createTransaction)
