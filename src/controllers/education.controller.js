import {
  getModulesService,
  getLessonsService,
  getLessonService,
  completeLessonService,
  getProgressService
} from '../services/education.service.js'
import { handleError } from '../lib/errors.js'

// GET /api/education/modules
export const getModules = async (req, res) => {
  try {
    res.json(await getModulesService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET MODULES')
  }
}

// GET /api/education/modules/:id/lessons
export const getLessons = async (req, res) => {
  try {
    res.json(await getLessonsService(req.user.id, req.params.id))
  } catch (error) {
    handleError(res, error, 'GET LESSONS')
  }
}

// GET /api/education/lessons/:id
export const getLesson = async (req, res) => {
  try {
    res.json(await getLessonService(req.user.id, req.params.id))
  } catch (error) {
    handleError(res, error, 'GET LESSON')
  }
}

// POST /api/education/lessons/:id/complete   body: { respuestas: [1, 0, 2, 1] } (solo quizzes)
export const completeLesson = async (req, res) => {
  try {
    res.json(await completeLessonService(req.user.id, req.params.id, req.body.respuestas))
  } catch (error) {
    handleError(res, error, 'COMPLETE LESSON')
  }
}

// GET /api/education/progress
export const getProgress = async (req, res) => {
  try {
    res.json(await getProgressService(req.user.id))
  } catch (error) {
    handleError(res, error, 'GET PROGRESS')
  }
}
