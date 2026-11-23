import { HttpError } from './errors.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Comprueba que el identificador sea una cadena con el formato hexadecimal de UUID.
export const esUUID = (valor) => typeof valor === 'string' && UUID_REGEX.test(valor)

// Acepta números y cadenas numéricas finitas mayores que cero y menores que 10¹³.
export const esNumeroPositivo = (valor) => {
  if (typeof valor === 'string' && valor.trim() === '') return false
  if (typeof valor !== 'number' && typeof valor !== 'string') return false

  const n = Number(valor)
  return Number.isFinite(n) && n > 0 && n < 1e13
}

// Comprueba que la cadena conserve algún carácter después de quitar espacios exteriores.
export const esTextoNoVacio = (valor) =>
  typeof valor === 'string' && valor.trim() !== ''

// Middleware: valida que :id (o el parámetro indicado) sea un UUID
// Evita que Postgres responda "invalid input syntax for type uuid" como error 500
export const validateUuidParam = (nombre = 'id') => (req, res, next) => {
  if (!esUUID(req.params[nombre])) {
    return res.status(400).json({ error: `${nombre} no es un identificador válido` })
  }
  next()
}

// Respuesta 400 corta para usar dentro de los validadores
export const rechazar = (res, mensaje) => res.status(400).json({ error: mensaje })

export { HttpError }
