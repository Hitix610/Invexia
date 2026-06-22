/*routes/transactions.routes.js*/

// Importar Router de Express
import { Router } from 'express'

// Importar middleware de autenticación
import { authMiddleware } from '../middleware/auth.js'

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

// Definir rutas para transacciones con middleware de autenticación
//get para obtener las transacciones del usuario
router.get('/', authMiddleware, getTransactions)

//get para obtener el historial de transacciones del usuario
router.get('/history', authMiddleware, getTransactionsHistory)

//post para crear una nueva transacción
router.post('/', authMiddleware, createTransaction)

//put para actualizar una transacción existente
router.put('/:id', authMiddleware, updateTransaction)

//delete para eliminar una transacción existente
router.delete('/:id', authMiddleware, deleteTransaction)

export default router