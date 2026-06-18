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
    const data = await getTransactionsService()

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

// ======================================================
// POST - Crear una nueva transacción
// ======================================================
export const createTransaction = async (req, res) => {
  try {
    console.log(req.body)

    const { amount, type } = req.body

    const data = await createTransactionService({
      amount,
      type
    })

    res.status(201).json(data)
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
    const data = await getTransactionsHistoryService()

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}