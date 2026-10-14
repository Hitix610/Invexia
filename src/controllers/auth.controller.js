import {
  registerService,
  loginService,
  refreshService,
  forgotPasswordService
} from '../services/auth.service.js'
import { handleError } from '../lib/errors.js'

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
export const refresh = async (req, res) => {
  try {
    res.json(await refreshService({ refresh_token: req.body.refresh_token }))
  } catch (error) {
    handleError(res, error, 'REFRESH')
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    res.json(await forgotPasswordService({ email: req.body.email }))
  } catch (error) {
    handleError(res, error, 'FORGOT PASSWORD')
  }
}
