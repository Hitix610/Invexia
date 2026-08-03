import {
  registerService,
  loginService
} from '../services/auth.service.js'

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
    res.status(500).json({
      error: error.message
    })
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
    res.status(500).json({
      error: error.message
    })
  }
}