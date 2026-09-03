// Importamos todos los servicios relacionados con transacciones
import {
  getTransactionsService,
  createTransactionService,
  updateTransactionService,
  deleteTransactionService,
  getTransactionsHistoryService
} from '../services/transactions.service.js'


// ======================================================
// GET - Obtener todas las transacciones
// ======================================================
export const getTransactions = async (req, res) => {
  try {
    const data = await getTransactionsService(req.user.id)

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

import { verificarAlertaPresupuestoService } from '../services/budgets.service.js'

// ======================================================
// POST - Crear una nueva transacción
// ======================================================
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, categoria_id } = req.body

    const data = await createTransactionService({
      amount,
      type,
      categoria_id,
      usuario_id: req.user.id
    })

    let alerta = null

    if (type === 'gasto' && categoria_id) {
      const fecha = new Date()
      const mes = fecha.getMonth() + 1
      const anio = fecha.getFullYear()

      alerta = await verificarAlertaPresupuestoService(
        req.user.id,
        categoria_id,
        mes,
        anio
      )
    }

    res.status(201).json({
      transaccion: data,
      alerta
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

// ======================================================
// PUT - Actualizar una transacción existente
// ======================================================
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, type } = req.body

    const data = await updateTransactionService(id, {
      monto: amount,
      tipo: type
    })

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

// ======================================================
// DELETE - Eliminar una transacción
// ======================================================
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const data = await deleteTransactionService(id)

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

// ======================================================
// GET - Historial de transacciones ordenado por fecha
// ======================================================
export const getTransactionsHistory = async (req, res) => {
  try {
    const data = await getTransactionsHistoryService(req.user.id)

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}