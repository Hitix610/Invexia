// Diagnóstico de consola para validar las claves de Belvo sin imprimirlas.
import dotenv from 'dotenv'
import { checkBelvoCredentials } from '../services/belvo.service.js'

dotenv.config({ path: '.env.belvo', quiet: true })

const environment = process.env.BELVO_ENV || 'sandbox'

try {
  // El código de salida permite que otra herramienta detecte un diagnóstico fallido.
  const status = await checkBelvoCredentials({
    environment,
    secretId: process.env.BELVO_SECRET_ID,
    secretPassword: process.env.BELVO_SECRET_PASSWORD
  })

  if (status === 200) {
    console.log(`Belvo aceptó las credenciales de ${environment} (HTTP 200).`)
  } else if (status === 401) {
    throw new Error('Belvo rechazó las credenciales (HTTP 401). Revisa las claves y su entorno.')
  } else if (status === 403) {
    throw new Error('Belvo denegó el acceso al catálogo de instituciones (HTTP 403). Revisa los permisos.')
  } else {
    throw new Error(`Belvo respondió con HTTP ${status}.`)
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
