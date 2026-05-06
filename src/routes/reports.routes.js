// Importa Express para crear el enrutador
import express from 'express'

// Importa el controlador que maneja la lógica del endpoint
import { getSummaryController } from '../controllers/reports.controller.js'

// Crea una instancia del enrutador de Express
const router = express.Router()

// Define la ruta GET /reports/summary y la conecta con su controlador
router.get('/summary', getSummaryController)

// Exporta el enrutador para usarlo en server.js
export default router

