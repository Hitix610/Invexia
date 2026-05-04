// Importa la función de negocio que calcula el resumen financiero
import { getSummary } from '../services/reports.service.js'

// Controlador que maneja la petición HTTP GET /api/reports/summary
export const getSummaryController = async (req, res) => {
  try {
    // Llama al servicio para obtener el resumen financiero
    const data = await getSummary()

    // Responde al cliente con los datos en formato JSON
    res.json(data)
  } catch (error) {
    // Si algo falla, responde con un error 500 y el mensaje del error
    res.status(500).json({ error: error.message })
  }
}