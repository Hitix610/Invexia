import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateUuidParam } from '../lib/validators.js'
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
  deleteNotification
} from '../controllers/notifications.controller.js'

const router = Router()

// Lista las notificaciones de la cuenta autenticada con filtros opcionales.
router.get('/', authMiddleware, getNotifications)

// Estas dos rutas fijas van ANTES de las que usan :id
router.get('/unread-count', authMiddleware, getUnreadCount)
router.put('/read-all', authMiddleware, markAllRead)

// Marcar o eliminar una notificación individual requiere un UUID.
router.put('/:id/read', authMiddleware, validateUuidParam(), markRead)
router.delete('/:id', authMiddleware, validateUuidParam(), deleteNotification)

export default router
