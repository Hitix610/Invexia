// Importar los servicios de metas
import {
  getGoalsService,
  createGoalService,
  updateGoalService,
  deleteGoalService,
  createGoalContributionService,
  getGoalContributionsService
} from '../services/goals.service.js'
import { handleError } from '../lib/errors.js'

const ESTADOS_META = ['activa', 'completada', 'pausada', 'cancelada']

// ==========================================
// GET - Obtener todas las metas
// ==========================================
export const getGoals = async (req, res) => {
  try {
    res.json(await getGoalsService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET GOALS')
  }
}

// ==========================================
// POST - Crear una meta
// ==========================================
export const createGoal = async (req, res) => {
  try {
    res.status(201).json(await createGoalService(req.body, req.user.id))
  } catch (error) {
    handleError(res, error, 'CREATE GOAL')
  }
}

// ==========================================
// PUT - Actualizar una meta
// ==========================================
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, monto_objetivo, fecha_limite, icono, color, estado } = req.body

    const updates = {}
    if (nombre !== undefined) updates.nombre = nombre
    if (descripcion !== undefined) updates.descripcion = descripcion
    if (monto_objetivo !== undefined) updates.monto_objetivo = monto_objetivo
    if (fecha_limite !== undefined) updates.fecha_limite = fecha_limite
    if (icono !== undefined) updates.icono = icono
    if (color !== undefined) updates.color = color
    if (estado !== undefined) {
      if (!ESTADOS_META.includes(estado)) {
        return res.status(400).json({ error: `estado debe ser uno de: ${ESTADOS_META.join(', ')}` })
      }
      updates.estado = estado
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    res.json(await updateGoalService(id, req.user.id, updates))
  } catch (error) {
    handleError(res, error, 'UPDATE GOAL')
  }
}

// ==========================================
// DELETE - Eliminar una meta
// ==========================================
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params

    res.json(await deleteGoalService(id, req.user.id))
  } catch (error) {
    handleError(res, error, 'DELETE GOAL')
  }
}

// ==========================================
// POST - Crear un aporte a una meta
// ==========================================
export const createGoalContribution = async (req, res) => {
  try {
    const { id } = req.params
    const { monto, nota } = req.body

    const data = await createGoalContributionService(id, req.user.id, monto, nota)

    res.status(201).json(data)
  } catch (error) {
    handleError(res, error, 'CREATE CONTRIBUTION')
  }
}

// ==========================================
// GET - Obtener aportes de una meta
// ==========================================
export const getGoalContributions = async (req, res) => {
  try {
    const { id } = req.params

    res.json(await getGoalContributionsService(id, req.user.id))
  } catch (error) {
    handleError(res, error, 'GET CONTRIBUTIONS')
  }
}
