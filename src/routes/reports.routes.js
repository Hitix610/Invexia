import express from 'express'
import { getSummaryController } from '../controllers/reports.controller.js'

const router = express.Router()

router.get('/reports/summary', getSummaryController)

export default router