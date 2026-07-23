// Importar los servicios de metas
import {
  getGoalsService,
  createGoalService,
  updateGoalService,
  deleteGoalService
} from '../services/goals.service.js'

// ==========================================
// GET - Obtener todas las metas
// ==========================================
export const getGoals = async (req, res) => {
  try {
    const data = await getGoalsService()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ==========================================
// POST - Crear una meta
// ==========================================
export const createGoal = async (req, res) => {
  try {
    const data = await createGoalService(req.body)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ==========================================
// PUT - Actualizar una meta
// ==========================================
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params

    const data = await updateGoalService(id, req.body)

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params

    const data = await deleteGoalService(id)

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}