import { esTextoNoVacio, rechazar } from '../lib/validators.js'

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

// Valida los campos opcionales. Devuelve true si todo está bien.
const validarOpcionales = (res, { hora, dias_semana, activo }) => {
  if (hora !== undefined && hora !== null && !HORA_REGEX.test(hora)) {
    rechazar(res, 'hora debe tener formato HH:MM (24 horas), por ejemplo 20:00')
    return false
  }

  if (dias_semana !== undefined && dias_semana !== null) {
    const valido =
      Array.isArray(dias_semana) &&
      dias_semana.length > 0 &&
      dias_semana.every((d) => Number.isInteger(d) && d >= 1 && d <= 7) &&
      new Set(dias_semana).size === dias_semana.length

    if (!valido) {
      rechazar(res, 'dias_semana debe ser un arreglo de números del 1 (lunes) al 7 (domingo), sin repetir')
      return false
    }
  }

  if (activo !== undefined && typeof activo !== 'boolean') {
    rechazar(res, 'activo debe ser true o false')
    return false
  }

  return true
}

// POST: tipo obligatorio
export const validateReminder = (req, res, next) => {
  if (!esTextoNoVacio(req.body.tipo) || req.body.tipo.length > 50) {
    return rechazar(res, 'tipo es obligatorio (máximo 50 caracteres)')
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}

// PUT: solo valida lo que venga
export const validateReminderUpdate = (req, res, next) => {
  const { tipo } = req.body

  if (tipo !== undefined && (!esTextoNoVacio(tipo) || tipo.length > 50)) {
    return rechazar(res, 'tipo no puede estar vacío (máximo 50 caracteres)')
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}
