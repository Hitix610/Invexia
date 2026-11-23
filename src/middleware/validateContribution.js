import { esNumeroPositivo, rechazar } from '../lib/validators.js'

// POST /api/goals/:id/aportes
// Comprueba que el aporte tenga un monto positivo y una nota opcional de hasta 500 caracteres.
export const validateContribution = (req, res, next) => {
  const { monto, nota } = req.body

  if (!esNumeroPositivo(monto)) {
    return rechazar(res, 'monto debe ser un número mayor a 0')
  }

  if (nota !== undefined && nota !== null && (typeof nota !== 'string' || nota.length > 500)) {
    return rechazar(res, 'nota debe ser texto de máximo 500 caracteres')
  }

  next()
}
