import { registerService } from '../services/auth.service.js'

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