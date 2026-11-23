import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateProfileUpdate } from '../middleware/validateProfile.js'
import { getProfile, updateProfile } from '../controllers/profile.controller.js'

const router = Router()

// Consulta el perfil asociado a la sesión autenticada.
router.get('/', authMiddleware, getProfile)
// Valida los campos del perfil antes de actualizarlo con la sesión autenticada.
router.put('/', authMiddleware, validateProfileUpdate, updateProfile)

export default router
