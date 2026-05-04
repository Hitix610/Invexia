import { getSummary } from '../services/reports.service.js'

export const getSummaryController = async (req, res) => {
  try {
    const data = await getSummary()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}