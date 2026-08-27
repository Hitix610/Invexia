// Importar Router de Express
import { Router } from 'express'

// Importar middleware de autenticación
import { authMiddleware } from '../middleware/auth.js'

// Importar middlewares de validación
import { validateGoal } from '../middleware/validateGoal.js'
import { validateGoalUpdate } from '../middleware/validateGoalUpdate.js'

// Importar los controladores
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} from '../controllers/goals.controller.js'

// Crear el router
const router = Router()

// ==========================================
// GET - Obtener todas las metas
// ==========================================
router.get('/', authMiddleware, getGoals)

// ==========================================
// POST - Crear una nueva meta
// ==========================================
router.post('/', authMiddleware, validateGoal, createGoal)

// ==========================================
// PUT - Actualizar una meta
// ==========================================
router.put('/:id', authMiddleware, validateGoalUpdate, updateGoal)

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
router.delete('/:id', authMiddleware, deleteGoal)

// Exportar el router
export default router