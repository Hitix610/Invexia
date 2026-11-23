// Genera una URL de prueba para abrir el widget fuera de la página de Fintrack.
import dotenv from 'dotenv'
import { createSandboxWidget } from '../services/belvo.service.js'

dotenv.config({ path: '.env.belvo', quiet: true })

try {
  const url = await createSandboxWidget({
    // Usa los enlaces de retorno de Invexia para la prueba manual.
    callbackUrls: {
      success: 'invexia://success',
      exit: 'invexia://exit',
      event: 'invexia://error'
    }
  })
  // Con --check solo informa el resultado y evita imprimir la URL con el token.
  console.log(process.argv.includes('--check') ? 'Belvo Sandbox generó el token del widget.' : url)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
