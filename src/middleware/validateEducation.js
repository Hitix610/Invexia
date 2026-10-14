import { rechazar } from '../lib/validators.js'

// POST /api/education/lessons/:id/complete
// `respuestas` es opcional aquí (las lecciones sin quiz no la envían);
// si viene, debe ser un arreglo de índices enteros >= 0. El service valida la cantidad.
export const validateCompleteLesson = (req, res, next) => {
  const { respuestas } = req.body

  if (respuestas !== undefined) {
    const valido =
      Array.isArray(respuestas) && respuestas.every((r) => Number.isInteger(r) && r >= 0)

    if (!valido) {
      return rechazar(res, 'respuestas debe ser un arreglo de índices enteros (0, 1, 2...), uno por pregunta')
    }
  }

  next()
}
