// src/middleware/validateTransaction.js
import { esNumeroPositivo, esUUID, rechazar } from '../lib/validators.js'
import { esFechaISO } from '../lib/dates.js'

const TIPOS = ['ingreso', 'gasto', 'transferencia']

// Valida los campos opcionales (iguales en POST y PUT). Devuelve true si todo está bien.
const validarOpcionales = (res, body) => {
  const { categoria_id, cuenta_id, fecha, descripcion, comercio, notas } = body

  if (categoria_id !== undefined && categoria_id !== null && !esUUID(categoria_id)) {
    rechazar(res, 'categoria_id no es un identificador válido')
    return false
  }

  if (cuenta_id !== undefined && cuenta_id !== null && !esUUID(cuenta_id)) {
    rechazar(res, 'cuenta_id no es un identificador válido')
    return false
  }

  if (fecha !== undefined && !esFechaISO(fecha)) {
    rechazar(res, 'fecha debe tener formato YYYY-MM-DD y ser una fecha real')
    return false
  }

  if (comercio !== undefined && comercio !== null && (typeof comercio !== 'string' || comercio.length > 200)) {
    rechazar(res, 'comercio debe ser texto de máximo 200 caracteres')
    return false
  }

  for (const [nombre, valor] of [['descripcion', descripcion], ['notas', notas]]) {
    if (valor !== undefined && valor !== null && typeof valor !== 'string') {
      rechazar(res, `${nombre} debe ser texto`)
      return false
    }
  }

  return true
}

// POST: amount y type obligatorios
export const validateTransaction = (req, res, next) => {
  const { amount, type } = req.body

  if (!esNumeroPositivo(amount)) {
    return rechazar(res, 'amount debe ser un número mayor a 0')
  }

  if (!TIPOS.includes(type)) {
    return rechazar(res, `type debe ser uno de: ${TIPOS.join(', ')}`)
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}

// PUT: solo valida lo que venga
export const validateTransactionUpdate = (req, res, next) => {
  const { amount, type } = req.body

  if (amount !== undefined && !esNumeroPositivo(amount)) {
    return rechazar(res, 'amount debe ser un número mayor a 0')
  }

  if (type !== undefined && !TIPOS.includes(type)) {
    return rechazar(res, `type debe ser uno de: ${TIPOS.join(', ')}`)
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}
