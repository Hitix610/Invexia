// Importa Express para crear el enrutador
import express from 'express'

// Importa los controladores
import {
  getSummaryController,
  getExpensesByCategoryController
} from '../controllers/reports.controller.js'

// Crea una instancia del enrutador de Express
const router = express.Router()

// Resumen financiero
router.get('/summary', getSummaryController)

// Gastos por categoría
router.get('/categories', getExpensesByCategoryController)

// Exporta el enrutador
export default router