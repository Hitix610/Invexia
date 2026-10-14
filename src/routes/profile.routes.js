import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateProfileUpdate } from '../middleware/validateProfile.js'
import { getProfile, updateProfile } from '../controllers/profile.controller.js'

const router = Router()

router.get('/', authMiddleware, getProfile)
router.put('/', authMiddleware, validateProfileUpdate, updateProfile)

export default router
