import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgets.controller.js'

const router = Router()

// get all budgets
router.get('/', authMiddleware, getBudgets)

// crea nuevo presupuesto
router.post('/', authMiddleware, createBudget)

// actualiza un presupuesto existente
router.put('/:id', authMiddleware, updateBudget)

// elimina un presupuesto existente
router.delete('/:id', authMiddleware, deleteBudget)

export default router
