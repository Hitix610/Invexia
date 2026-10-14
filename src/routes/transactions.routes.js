/*routes/transactions.routes.js*/

// Importar Router de Express
import { Router } from 'express'

// Importar middleware de autenticación y validación
import { authMiddleware } from '../middleware/auth.js'
import {
  validateTransaction,
  validateTransactionUpdate
} from '../middleware/validateTransaction.js'
import { validateUuidParam } from '../lib/validators.js'

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

// get para obtener las transacciones del usuario (acepta filtros por query)
router.get('/', authMiddleware, getTransactions)

// get para obtener el historial de transacciones del usuario
router.get('/history', authMiddleware, getTransactionsHistory)

// post para crear una nueva transacción
router.post('/', authMiddleware, validateTransaction, createTransaction)

// put para actualizar una transacción existente
router.put('/:id', authMiddleware, validateUuidParam(), validateTransactionUpdate, updateTransaction)

// delete para eliminar una transacción existente
router.delete('/:id', authMiddleware, validateUuidParam(), deleteTransaction)

export default router
