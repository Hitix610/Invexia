// Error con código HTTP para poder responder 400/403/404/409 en vez de siempre 500
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Respuesta de error uniforme para todos los controllers
export const handleError = (res, error, contexto) => {
  if (!error.status) {
    console.error(contexto ? `${contexto}:` : 'ERROR:', error.message)
  }

  res.status(error.status || 500).json({ error: error.message })
}

// Lanza el error de Supabase si lo hay; si no, devuelve los datos
export const must = ({ data, error }) => {
  if (error) {
    throw new Error(error.message)
  }
  return data
}
