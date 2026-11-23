import {
  getModulesService,
  getLessonsService,
  getLessonService,
  completeLessonService,
  getProgressService
} from '../services/education.service.js'
import { handleError } from '../lib/errors.js'

// GET /api/education/modules
// Devuelve los módulos con el estado de avance y desbloqueo del usuario.
export const getModules = async (req, res) => {
  try {
    res.json(await getModulesService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET MODULES')
  }
}

// GET /api/education/modules/:id/lessons
// Lista las lecciones del módulo solicitado para el usuario autenticado.
export const getLessons = async (req, res) => {
  try {
    res.json(await getLessonsService(req.user.id, req.params.id))
  } catch (error) {
    handleError(res, error, 'GET LESSONS')
  }
}

// GET /api/education/lessons/:id
// Devuelve el contenido de una lección y, cuando corresponde, sus preguntas.
export const getLesson = async (req, res) => {
  try {
    res.json(await getLessonService(req.user.id, req.params.id))
  } catch (error) {
    handleError(res, error, 'GET LESSON')
  }
}

// POST /api/education/lessons/:id/complete   body: { respuestas: [1, 0, 2, 1] } (solo quizzes)
// Envía al servicio el intento de completar la lección, con respuestas cuando hay un cuestionario.
export const completeLesson = async (req, res) => {
  try {
    res.json(await completeLessonService(req.user.id, req.params.id, req.body.respuestas))
  } catch (error) {
    handleError(res, error, 'COMPLETE LESSON')
  }
}

// GET /api/education/progress
// Devuelve el progreso educativo acumulado del usuario.
export const getProgress = async (req, res) => {
  try {
    res.json(await getProgressService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET PROGRESS')
  }
}
