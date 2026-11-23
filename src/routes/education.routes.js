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

// Los módulos y las lecciones se consultan con la sesión del usuario.
router.get('/modules', authMiddleware, getModules)
// Las rutas de detalle validan el UUID del módulo o de la lección.
router.get('/modules/:id/lessons', authMiddleware, validateUuidParam(), getLessons)
router.get('/lessons/:id', authMiddleware, validateUuidParam(), getLesson)
// Valida las respuestas de la lección antes de registrar el intento.
router.post('/lessons/:id/complete', authMiddleware, validateUuidParam(), validateCompleteLesson, completeLesson)
// Consulta el progreso educativo de la sesión autenticada.
router.get('/progress', authMiddleware, getProgress)

export default router
