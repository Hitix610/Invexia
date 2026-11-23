import {
  registerService,
  loginService,
  refreshService,
  forgotPasswordService
} from '../services/auth.service.js'
import { handleError } from '../lib/errors.js'

// Crea una cuenta con el correo, la contraseña y el nombre, y responde con estado 201.
export const register = async (req, res) => {
  try {
    const { email, password, nombre } = req.body

    const data = await registerService({
      email,
      password,
      nombre
    })

    res.status(201).json(data)
  } catch (error) {
    handleError(res, error, 'REGISTER')
  }
}

// Envía las credenciales al servicio de autenticación y devuelve el resultado del inicio de sesión.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const data = await loginService({
      email,
      password
    })

    res.json(data)
  } catch (error) {
    handleError(res, error, 'LOGIN')
  }
}

// POST /api/auth/refresh
// Renueva la sesión con el token de renovación enviado en el cuerpo de la petición.
export const refresh = async (req, res) => {
  try {
    res.json(await refreshService({ refresh_token: req.body.refresh_token }))
  } catch (error) {
    handleError(res, error, 'REFRESH')
  }
}

// POST /api/auth/forgot-password
// Solicita el correo de recuperación y devuelve la respuesta genérica del servicio.
export const forgotPassword = async (req, res) => {
  try {
    res.json(await forgotPasswordService({ email: req.body.email }))
  } catch (error) {
    handleError(res, error, 'FORGOT PASSWORD')
  }
}
