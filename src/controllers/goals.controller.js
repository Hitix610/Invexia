// Importar los servicios de metas
import {
  getGoalsService,
  createGoalService,
  updateGoalService,
  deleteGoalService,
  createGoalContributionService,
  getGoalContributionsService
} from '../services/goals.service.js'

// ==========================================
// GET - Obtener todas las metas
// ==========================================
export const getGoals = async (req, res) => {
  try {
    const data = await getGoalsService(req.user.id)
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
    const data = await createGoalService(req.body, req.user.id)
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

    const data = await updateGoalService(id, req.user.id, req.body)

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

    const data = await deleteGoalService(id, req.user.id)

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// ==========================================
// POST - Crear un aporte a una meta
// ==========================================
export const createGoalContribution = async (req, res) => {
  try {

    const { id } = req.params
    const { monto, nota } = req.body

    const data = await createGoalContributionService(
      id,
      req.user.id,
      monto,
      nota
    )

    res.status(201).json(data)

  } catch (error) {

    console.error(
      'CREATE CONTRIBUTION ERROR:',
      error.message
    )

    res.status(500).json({
      error: error.message
    })
  }
}


// ==========================================
// GET - Obtener aportes de una meta
// ==========================================
export const getGoalContributions = async (req, res) => {
  try {

    const { id } = req.params

    const data = await getGoalContributionsService(
      id,
      req.user.id
    )

    res.json(data)

  } catch (error) {

    console.error(
      'GET CONTRIBUTIONS ERROR:',
      error.message
    )

    res.status(500).json({
      error: error.message
    })
  }
}