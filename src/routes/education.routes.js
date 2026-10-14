import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateUuidParam } from '../lib/validators.js'
import { validateCompleteLesson } from '../middleware/validateEducation.js'
import {
  getModules,
  getLessons,
  getLesson,
  completeLesson,
  getProgress
} from '../controllers/education.controller.js'

const router = Router()

router.get('/modules', authMiddleware, getModules)
router.get('/modules/:id/lessons', authMiddleware, validateUuidParam(), getLessons)
router.get('/lessons/:id', authMiddleware, validateUuidParam(), getLesson)
router.post('/lessons/:id/complete', authMiddleware, validateUuidParam(), validateCompleteLesson, completeLesson)
router.get('/progress', authMiddleware, getProgress)

export default router
