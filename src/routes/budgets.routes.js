import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getBudgets } from '../controllers/budgets.controller.js'

const router = Router()

// get all budgets
router.get('/', authMiddleware, getBudgets)

// crea nuevo presupuesto
export default router
