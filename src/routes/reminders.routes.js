import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateUuidParam } from '../lib/validators.js'
import { validateReminder, validateReminderUpdate } from '../middleware/validateReminder.js'
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} from '../controllers/reminders.controller.js'

const router = Router()

// Lista los recordatorios de la sesión autenticada.
router.get('/', authMiddleware, getReminders)
// Valida la configuración del recordatorio antes de crearlo.
router.post('/', authMiddleware, validateReminder, createReminder)
// Actualizar y eliminar requieren un UUID de recordatorio. La actualización valida los cambios.
router.put('/:id', authMiddleware, validateUuidParam(), validateReminderUpdate, updateReminder)
router.delete('/:id', authMiddleware, validateUuidParam(), deleteReminder)

export default router
