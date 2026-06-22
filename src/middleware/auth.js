// middleware jwt

import { supabase } from '../config/supabase.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token requerido'
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido'
      })
    }

    req.user = user

    next()
  } catch (error) {
    return res.status(500).json({
      error: 'Error de autenticación'
    })
  }
}