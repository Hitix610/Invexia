import { Router } from 'express'
import {
  register,
  login,
  refresh,
  forgotPassword
} from '../controllers/auth.controller.js'
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateRefresh
} from '../middleware/validateAuth.js'

const router = Router()

// Valida los datos de registro antes de crear la cuenta.
router.post('/register', validateRegister, register)

// Valida el correo y la contraseña recibidos antes de iniciar la sesión.
router.post('/login', validateLogin, login)

// Exige que el cuerpo incluya un token de renovación antes de invocar el controlador.
router.post('/refresh', validateRefresh, refresh)

// Valida el correo para iniciar la recuperación de la cuenta.
router.post('/forgot-password', validateForgotPassword, forgotPassword)

export default router
