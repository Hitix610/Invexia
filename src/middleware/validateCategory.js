import { esTextoNoVacio, rechazar } from '../lib/validators.js'

const TIPOS = ['ingreso', 'gasto', 'ambos']
const COLOR_HEX = /^#[0-9a-fA-F]{6}$/

const validarOpcionales = (res, { icono, color }) => {
  if (icono !== undefined && icono !== null && (typeof icono !== 'string' || icono.length > 50)) {
    rechazar(res, 'icono debe ser texto de máximo 50 caracteres')
    return false
  }

  if (color !== undefined && color !== null && !COLOR_HEX.test(color)) {
    rechazar(res, 'color debe tener formato hexadecimal, por ejemplo #FF6B6B')
    return false
  }

  return true
}

// POST: nombre y tipo obligatorios
export const validateCategory = (req, res, next) => {
  const { nombre, tipo } = req.body

  if (!esTextoNoVacio(nombre) || nombre.length > 100) {
    return rechazar(res, 'nombre es obligatorio (máximo 100 caracteres)')
  }

  if (!TIPOS.includes(tipo)) {
    return rechazar(res, `tipo debe ser uno de: ${TIPOS.join(', ')}`)
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}

// PUT: solo valida lo que venga
export const validateCategoryUpdate = (req, res, next) => {
  const { nombre, tipo } = req.body

  if (nombre !== undefined && (!esTextoNoVacio(nombre) || nombre.length > 100)) {
    return rechazar(res, 'nombre no puede estar vacío (máximo 100 caracteres)')
  }

  if (tipo !== undefined && !TIPOS.includes(tipo)) {
    return rechazar(res, `tipo debe ser uno de: ${TIPOS.join(', ')}`)
  }

  if (!validarOpcionales(res, req.body)) return

  next()
}
