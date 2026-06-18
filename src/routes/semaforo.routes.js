import express from 'express'

import {
  getFinancialSemaphoreController
} from '../controllers/semaforo.controller.js'

const router = express.Router()

// GET /api/semaforo
router.get('/', getFinancialSemaphoreController)

export default router