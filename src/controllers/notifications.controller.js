import {
  getNotificationsService,
  countUnreadNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  deleteNotificationService
} from '../services/notifications.service.js'
import { handleError } from '../lib/errors.js'

// GET /api/notifications?leida=false&limit=50
// Aplica los filtros válidos de lectura y cantidad. El servicio usa sus valores por defecto en los demás casos.
export const getNotifications = async (req, res) => {
  try {
    const { leida, limit } = req.query

    const filters = {}

    if (leida === 'true' || leida === 'false') {
      filters.leida = leida === 'true'
    }

    const limitNum = Number(limit)
    if (Number.isInteger(limitNum) && limitNum >= 1 && limitNum <= 200) {
      filters.limit = limitNum
    }

    res.json(await getNotificationsService(req.user.id, filters))
  } catch (error) {
    handleError(res, error, 'GET NOTIFICATIONS')
  }
}

// GET /api/notifications/unread-count
// Devuelve cuántas notificaciones del usuario siguen pendientes de lectura.
export const getUnreadCount = async (req, res) => {
  try {
    res.json(await countUnreadNotificationsService(req.user.id))
  } catch (error) {
    handleError(res, error, 'UNREAD COUNT')
  }
}

// PUT /api/notifications/read-all
// Marca como leídas las notificaciones pendientes del usuario.
export const markAllRead = async (req, res) => {
  try {
    res.json(await markAllNotificationsReadService(req.user.id))
  } catch (error) {
    handleError(res, error, 'MARK ALL READ')
  }
}

// PUT /api/notifications/:id/read
// Marca como leída una notificación identificada de la cuenta del usuario.
export const markRead = async (req, res) => {
  try {
    res.json(await markNotificationReadService(req.params.id, req.user.id))
  } catch (error) {
    handleError(res, error, 'MARK READ')
  }
}

// DELETE /api/notifications/:id
// Solicita la eliminación de una notificación del usuario mediante su identificador.
export const deleteNotification = async (req, res) => {
  try {
    res.json(await deleteNotificationService(req.params.id, req.user.id))
  } catch (error) {
    handleError(res, error, 'DELETE NOTIFICATION')
  }
}
