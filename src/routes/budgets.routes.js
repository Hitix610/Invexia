import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateBudget } from '../middleware/validateBudget.js'
import { validateBudgetUpdate } from '../middleware/validateBudgetUpdate.js'
import { validateUuidParam } from '../lib/validators.js'
import {
  getBudgets,
  getBudgetsStatus,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budgets.controller.js'

const router = Router()

// get all budgets (acepta ?mes=&anio=)
router.get('/', authMiddleware, getBudgets)

// presupuestos del mes con gastado, porcentaje y estado (ok / advertencia / excedido)
router.get('/status', authMiddleware, getBudgetsStatus)

// crea nuevo presupuesto
router.post('/', authMiddleware, validateBudget, createBudget)

// actualiza un presupuesto existente
router.put('/:id', authMiddleware, validateUuidParam(), validateBudgetUpdate, updateBudget)

// elimina un presupuesto existente
router.delete('/:id', authMiddleware, validateUuidParam(), deleteBudget)

export default router
