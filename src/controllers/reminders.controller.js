import {
  getRemindersService,
  createReminderService,
  updateReminderService,
  deleteReminderService
} from '../services/reminders.service.js'
import { handleError } from '../lib/errors.js'

export const getReminders = async (req, res) => {
  try {
    res.json(await getRemindersService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET REMINDERS')
  }
}

export const createReminder = async (req, res) => {
  try {
    const { tipo, hora, dias_semana, activo } = req.body

    res.status(201).json(
      await createReminderService(req.user.id, { tipo, hora, dias_semana, activo })
    )
  } catch (error) {
    handleError(res, error, 'CREATE REMINDER')
  }
}

export const updateReminder = async (req, res) => {
  try {
    const { tipo, hora, dias_semana, activo } = req.body

    const updates = {}
    if (tipo !== undefined) updates.tipo = tipo
    if (hora !== undefined) updates.hora = hora
    if (dias_semana !== undefined) updates.dias_semana = dias_semana
    if (activo !== undefined) updates.activo = activo

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    res.json(await updateReminderService(req.params.id, req.user.id, updates))
  } catch (error) {
    handleError(res, error, 'UPDATE REMINDER')
  }
}

export const deleteReminder = async (req, res) => {
  try {
    res.json(await deleteReminderService(req.params.id, req.user.id))
  } catch (error) {
    handleError(res, error, 'DELETE REMINDER')
  }
}
