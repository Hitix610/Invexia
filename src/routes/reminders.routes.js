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

router.get('/', authMiddleware, getReminders)
router.post('/', authMiddleware, validateReminder, createReminder)
router.put('/:id', authMiddleware, validateUuidParam(), validateReminderUpdate, updateReminder)
router.delete('/:id', authMiddleware, validateUuidParam(), deleteReminder)

export default router
