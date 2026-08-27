import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateBudget } from '../middleware/validateBudget.js'
import { validateBudgetUpdate } from '../middleware/validateBudgetUpdate.js'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgets.controller.js'

const router = Router()

// get all budgets
router.get('/', authMiddleware, getBudgets)

// crea nuevo presupuesto
router.post('/', authMiddleware, validateBudget, createBudget)

// actualiza un presupuesto existente
router.put('/:id', authMiddleware, validateBudgetUpdate, updateBudget)

// elimina un presupuesto existente
router.delete('/:id', authMiddleware, deleteBudget)

export default router
