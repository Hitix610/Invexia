import { esTextoNoVacio, rechazar } from '../lib/validators.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailValido = (email) => typeof email === 'string' && EMAIL_REGEX.test(email.trim())

// RF-01: contraseña de mínimo 8 caracteres con letras y números
export const validateRegister = (req, res, next) => {
  const { email, password, nombre } = req.body

  if (!emailValido(email)) {
    return rechazar(res, 'email no tiene un formato válido')
  }

  if (typeof password !== 'string' || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return rechazar(res, 'password debe tener mínimo 8 caracteres, con letras y números')
  }

  if (!esTextoNoVacio(nombre) || nombre.length > 100) {
    return rechazar(res, 'nombre es obligatorio (máximo 100 caracteres)')
  }

  next()
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!emailValido(email) || !esTextoNoVacio(password)) {
    return rechazar(res, 'email y password son obligatorios')
  }

  next()
}

export const validateForgotPassword = (req, res, next) => {
  if (!emailValido(req.body.email)) {
    return rechazar(res, 'email no tiene un formato válido')
  }

  next()
}

export const validateRefresh = (req, res, next) => {
  if (!esTextoNoVacio(req.body.refresh_token)) {
    return rechazar(res, 'refresh_token es obligatorio')
  }

  next()
}
