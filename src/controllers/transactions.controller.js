// Importamos todos los servicios relacionados con transacciones
import {
  getTransactionsService,
  createTransactionService,
  updateTransactionService,
  deleteTransactionService,
  getTransactionsHistoryService
} from '../services/transactions.service.js'
import { verificarAlertaPresupuestoService } from '../services/budgets.service.js'
import { handleError } from '../lib/errors.js'
import { esFechaISO } from '../lib/dates.js'
import { esUUID } from '../lib/validators.js'

const TIPOS = ['ingreso', 'gasto', 'transferencia']
const FUENTES = ['manual', 'belvo', 'importado']

// ======================================================
// GET - Obtener transacciones (filtros opcionales por query string)
// /api/transactions?tipo=gasto&categoria_id=...&fuente=belvo&desde=2026-05-01&hasta=2026-05-31&limit=50
// ======================================================
export const getTransactions = async (req, res) => {
  try {
    const { tipo, categoria_id, fuente, desde, hasta, limit } = req.query
    const filters = {}

    if (tipo !== undefined) {
      if (!TIPOS.includes(tipo)) {
        return res.status(400).json({ error: `tipo debe ser uno de: ${TIPOS.join(', ')}` })
      }
      filters.tipo = tipo
    }

    if (fuente !== undefined) {
      if (!FUENTES.includes(fuente)) {
        return res.status(400).json({ error: `fuente debe ser una de: ${FUENTES.join(', ')}` })
      }
      filters.fuente = fuente
    }

    if (categoria_id !== undefined) {
      if (!esUUID(categoria_id)) {
        return res.status(400).json({ error: 'categoria_id no es un identificador válido' })
      }
      filters.categoria_id = categoria_id
    }

    for (const [nombre, valor] of [['desde', desde], ['hasta', hasta]]) {
      if (valor !== undefined) {
        if (!esFechaISO(valor)) {
          return res.status(400).json({ error: `${nombre} debe tener formato YYYY-MM-DD` })
        }
        filters[nombre] = valor
      }
    }

    if (limit !== undefined) {
      const n = Number(limit)
      if (!Number.isInteger(n) || n < 1 || n > 500) {
        return res.status(400).json({ error: 'limit debe ser un entero entre 1 y 500' })
      }
      filters.limit = n
    }

    const data = await getTransactionsService(req.user.id, filters)

    res.json(data)
  } catch (error) {
    handleError(res, error, 'GET TRANSACTIONS')
  }
}

// ======================================================
// POST - Crear una nueva transacción
// Si es un gasto con categoría, revisa si cruzó el 80% / 100% del presupuesto.
// ======================================================
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, categoria_id, descripcion, comercio, fecha, notas, cuenta_id } = req.body

    const data = await createTransactionService({
      amount,
      type,
      categoria_id,
      descripcion,
      comercio,
      fecha,
      notas,
      cuenta_id,
      usuario_id: req.user.id
    })

    let alerta = null

    if (type === 'gasto' && categoria_id) {
      try {
        // El mes/año sale de la fecha de la transacción (puede ser de un mes anterior)
        const [anio, mes] = data[0].fecha.split('-').map(Number)

        alerta = await verificarAlertaPresupuestoService(req.user.id, categoria_id, mes, anio)
      } catch (alertaError) {
        // La transacción ya quedó guardada: un fallo en la alerta no debe devolver 500
        console.error('ALERTA PRESUPUESTO ERROR:', alertaError.message)
      }
    }

    res.status(201).json({
      transaccion: data,
      alerta
    })
  } catch (error) {
    handleError(res, error, 'CREATE TRANSACTION')
  }
}

// ======================================================
// PUT - Actualizar una transacción existente
// ======================================================
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, type, categoria_id, descripcion, comercio, fecha, notas, cuenta_id } = req.body

    const updates = {}
    if (amount !== undefined) updates.monto = Number(amount)
    if (type !== undefined) updates.tipo = type
    if (categoria_id !== undefined) updates.categoria_id = categoria_id
    if (descripcion !== undefined) updates.descripcion = descripcion
    if (comercio !== undefined) updates.comercio = comercio
    if (fecha !== undefined) updates.fecha = fecha
    if (notas !== undefined) updates.notas = notas
    if (cuenta_id !== undefined) updates.cuenta_id = cuenta_id

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    const data = await updateTransactionService(id, req.user.id, updates)

    res.json(data)
  } catch (error) {
    handleError(res, error, 'UPDATE TRANSACTION')
  }
}

// ======================================================
// DELETE - Eliminar una transacción
// ======================================================
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    const data = await deleteTransactionService(id, req.user.id)

    res.json(data)
  } catch (error) {
    handleError(res, error, 'DELETE TRANSACTION')
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
    handleError(res, error, 'GET HISTORY')
  }
}
