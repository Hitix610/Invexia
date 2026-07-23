// Importar Router de Express
import { Router } from 'express'

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
router.get('/', getGoals)

// ==========================================
// POST - Crear una nueva meta
// ==========================================
router.post('/', createGoal)

// ==========================================
// PUT - Actualizar una meta
// ==========================================
router.put('/:id', updateGoal)

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
router.delete('/:id', deleteGoal)

// Exportar el router
export default router