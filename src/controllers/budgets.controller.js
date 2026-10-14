import {
  getBudgetsService,
  getBudgetsStatusService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService
} from '../services/budgets.service.js'
import { handleError } from '../lib/errors.js'

// Lee ?mes=&anio= (opcionales). Devuelve null y responde 400 si son inválidos.
const leerMesAnio = (req, res) => {
  const { mes, anio } = req.query
  const filtros = {}

  if (mes !== undefined) {
    const m = Number(mes)
    if (!Number.isInteger(m) || m < 1 || m > 12) {
      res.status(400).json({ error: 'mes debe estar entre 1 y 12' })
      return null
    }
    filtros.mes = m
  }

  if (anio !== undefined) {
    const a = Number(anio)
    if (!Number.isInteger(a) || a < 2020) {
      res.status(400).json({ error: 'anio debe ser 2020 o posterior' })
      return null
    }
    filtros.anio = a
  }

  return filtros
}

// GET /api/budgets?mes=5&anio=2026
export const getBudgets = async (req, res) => {
  try {
    const filtros = leerMesAnio(req, res)
    if (!filtros) return

    res.json(await getBudgetsService(req.user.id, filtros))
  } catch (error) {
    handleError(res, error, 'GET BUDGETS')
  }
}

// GET /api/budgets/status?mes=5&anio=2026  (por defecto el mes actual)
export const getBudgetsStatus = async (req, res) => {
  try {
    const filtros = leerMesAnio(req, res)
    if (!filtros) return

    res.json(await getBudgetsStatusService(req.user.id, filtros))
  } catch (error) {
    handleError(res, error, 'GET BUDGETS STATUS')
  }
}

export const createBudget = async (req, res) => {
  try {
    const { categoria_id, monto_limite, mes, anio } = req.body

    const data = await createBudgetService({
      categoria_id,
      monto_limite,
      mes,
      anio,
      usuario_id: req.user.id
    })

    res.status(201).json(data)
  } catch (error) {
    handleError(res, error, 'CREATE BUDGET')
  }
}

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria_id, monto_limite, mes, anio } = req.body

    const updates = {}
    if (categoria_id !== undefined) updates.categoria_id = categoria_id
    if (monto_limite !== undefined) updates.monto_limite = monto_limite
    if (mes !== undefined) updates.mes = mes
    if (anio !== undefined) updates.anio = anio

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    res.json(await updateBudgetService(id, req.user.id, updates))
  } catch (error) {
    handleError(res, error, 'UPDATE BUDGET')
  }
}

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params

    res.json(await deleteBudgetService(id, req.user.id))
  } catch (error) {
    handleError(res, error, 'DELETE BUDGET')
  }
}
