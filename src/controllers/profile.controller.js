import { getProfileService, updateProfileService } from '../services/profile.service.js'
import { handleError } from '../lib/errors.js'

// Solo estos campos se pueden editar desde la app (el correo y el id no)
const CAMPOS_EDITABLES = [
  'nombre',
  'apellido',
  'foto_url',
  'moneda',
  'pais',
  'notificaciones_activas',
  'tutorial_completado'
]

// GET /api/profile
export const getProfile = async (req, res) => {
  try {
    res.json(await getProfileService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET PROFILE')
  }
}

// PUT /api/profile
export const updateProfile = async (req, res) => {
  try {
    const updates = {}

    for (const campo of CAMPOS_EDITABLES) {
      if (req.body[campo] !== undefined) {
        updates[campo] = typeof req.body[campo] === 'string' ? req.body[campo].trim() : req.body[campo]
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    res.json(await updateProfileService(req.user.id, updates))
  } catch (error) {
    handleError(res, error, 'UPDATE PROFILE')
  }
}
