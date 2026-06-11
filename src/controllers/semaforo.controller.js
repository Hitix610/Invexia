// Importamos el servicio que consulta el semáforo financiero
import { getFinancialSemaphore } from '../services/semaforo.service.js'

// Controlador para GET /api/semaforo
export const getFinancialSemaphoreController = async (req, res) => {
  try {

    // Obtener datos del semáforo
    const data = await getFinancialSemaphore()

    // Responder al cliente
    res.json(data)

  } catch (error) {

    // Si ocurre un error
    res.status(500).json({
      error: error.message
    })
  }
}