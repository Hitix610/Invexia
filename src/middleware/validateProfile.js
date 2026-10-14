import { rechazar } from '../lib/validators.js'

const CAMPOS_TEXTO = { nombre: 100, apellido: 100, pais: 50, moneda: 10 }

// PUT /api/profile — solo valida lo que venga
export const validateProfileUpdate = (req, res, next) => {
  const body = req.body

  for (const [campo, max] of Object.entries(CAMPOS_TEXTO)) {
    if (body[campo] !== undefined) {
      if (typeof body[campo] !== 'string' || body[campo].trim() === '' || body[campo].length > max) {
        if (!(campo === 'apellido' && body[campo] === null)) {
          return rechazar(res, `${campo} debe ser texto no vacío de máximo ${max} caracteres`)
        }
      }
    }
  }

  if (body.foto_url !== undefined && body.foto_url !== null && typeof body.foto_url !== 'string') {
    return rechazar(res, 'foto_url debe ser texto')
  }

  for (const campo of ['notificaciones_activas', 'tutorial_completado']) {
    if (body[campo] !== undefined && typeof body[campo] !== 'boolean') {
      return rechazar(res, `${campo} debe ser true o false`)
    }
  }

  next()
}
