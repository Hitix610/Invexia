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

router.post('/register', validateRegister, register)

router.post('/login', validateLogin, login)

router.post('/refresh', validateRefresh, refresh)

router.post('/forgot-password', validateForgotPassword, forgotPassword)

export default router
