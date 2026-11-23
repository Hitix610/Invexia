import express from 'express'

import {
  getFinancialSemaphoreController
} from '../controllers/semaforo.controller.js'

const router = express.Router()

// GET /api/semaforo
// Devuelve el semáforo del usuario de prueba configurado en el servicio.
router.get('/', getFinancialSemaphoreController)

export default router