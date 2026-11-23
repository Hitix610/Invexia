import { createHmac } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { HttpError } from '../lib/errors.js'

// La comprobación de claves admite ambos entornos. El widget y el importador usan Sandbox.
const baseUrls = new Map([
  ['sandbox', 'https://sandbox.belvo.com'],
  ['production', 'https://api.belvo.com']
])

// Prueba las claves contra el catálogo de instituciones y solo devuelve el estado HTTP.
export async function checkBelvoCredentials({ environment, secretId, secretPassword }) {
  const baseUrl = baseUrls.get(environment)
  if (!baseUrl) {
    throw new Error('BELVO_ENV debe ser sandbox o production.')
  }
  if (!secretId || !secretPassword) {
    throw new Error('Configura BELVO_SECRET_ID y BELVO_SECRET_PASSWORD en .env.belvo.')
  }

  const credentials = Buffer.from(`${secretId}:${secretPassword}`).toString('base64')
  let response
  try {
    response = await fetch(`${baseUrl}/api/institutions/?page_size=1`, {
      headers: { Authorization: `Basic ${credentials}`, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000)
    })
  } catch (error) {
    const code = error.cause?.code || error.name
    throw new Error(`No se pudo conectar con Belvo (${environment}, ${code}). Revisa la conexión e inténtalo de nuevo.`)
  }

  await response.body?.cancel()
  return response.status
}

// Comprueba que el servidor está configurado para Sandbox antes de usar sus claves.
function sandboxCredentials() {
  const { BELVO_ENV, BELVO_SECRET_ID: id, BELVO_SECRET_PASSWORD: password } = process.env
  if (BELVO_ENV !== 'sandbox' || !id || !password) {
    throw new HttpError(503, 'Configura las claves de Belvo Sandbox en el servidor.')
  }
  return { id, password }
}

// Genera la referencia opaca con la que se identifica al usuario al verificar el vínculo.
function externalIdFor(userId, password) {
  return createHmac('sha256', password).update('fintrack-widget:' + userId).digest('hex')
}

// Al pedir un token solo se reintentan fallos al establecer la conexión. Las lecturas
// también se pueden repetir si la conexión se interrumpe o se agota el tiempo de espera.
const connectionErrors = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'UND_ERR_CONNECT_TIMEOUT'])
const readErrors = new Set(['TimeoutError', 'ETIMEDOUT', 'ECONNRESET', 'UND_ERR_SOCKET'])

// Extrae los códigos de error, incluidos los que Node agrupa al probar varias direcciones.
function transportCodes(error) {
  const cause = error.cause || error
  return cause.errors?.length
    ? cause.errors.flatMap(transportCodes)
    : [typeof cause.code === 'string' ? cause.code : cause.name]
}

// Centraliza el límite de tiempo y realiza como máximo un reintento elegible.
async function sandboxRequest(path, options, action) {
  // Cada intento necesita su propia señal de tiempo de espera.
  const request = () => fetch(new URL(path, baseUrls.get('sandbox')), {
    ...options,
    redirect: 'error',
    signal: AbortSignal.timeout(10_000)
  })

  try {
    return await request()
  } catch (firstError) {
    const canRetry = transportCodes(firstError).every(code =>
      connectionErrors.has(code) || (!options.method && readErrors.has(code)))
    let error = firstError
    if (canRetry) {
      await delay(350)
      try {
        return await request()
      } catch (retryError) {
        error = retryError
      }
    }
    const code = transportCodes(error).find(code => connectionErrors.has(code) || readErrors.has(code))
    const detail = code ? ' (' + code + ')' : ''
    throw new HttpError(502, 'No se pudo conectar con Belvo Sandbox al ' + action + detail + '.')
  }
}

// Solicita un token temporal y arma la URL del widget para el banco simulado.
export async function createSandboxWidget({ callbackUrls, userId }) {
  const { id, password } = sandboxCredentials()
  const response = await sandboxRequest('/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      password,
      scopes: 'read_institutions,write_links,read_consents,write_consents,write_consent_callback,delete_consents',
      fetch_resources: ['ACCOUNTS', 'TRANSACTIONS'],
      widget: {
        openfinance_feature: 'consent_link_creation',
        callback_urls: callbackUrls,
        // Identidad y permisos del perfil público de prueba de Mock Bank.
        consent: {
          terms_and_conditions_url: 'https://www.belvo.com',
          permissions: ['REGISTER', 'ACCOUNTS', 'CREDIT_CARDS', 'CREDIT_OPERATIONS'],
          identification_info: [{ type: 'CPF', number: '76109277673', name: 'Ralph Bragg' }]
        }
      }
    })
  }, 'abrir el widget')

  if (!response.ok) {
    await response.body?.cancel()
    throw new HttpError(502, 'Belvo Sandbox rechazó la solicitud de token (HTTP ' + response.status + ').')
  }
  const { access } = await response.json()
  if (typeof access !== 'string' || !access) {
    throw new HttpError(502, 'Belvo no devolvió un token de acceso.')
  }

  const url = new URL('https://widget.belvo.io/')
  url.search = new URLSearchParams({
    access_token: access,
    locale: 'pt',
    access_mode: 'single',
    institutions: 'ofmockbank_br_retail'
  })
  if (userId) url.searchParams.set('external_id', externalIdFor(userId, password))
  return url.href
}

// Consulta el vínculo en Belvo y comprueba que su referencia corresponde al usuario de Fintrack.
export async function verifySandboxLink(linkId, userId) {
  const { id, password } = sandboxCredentials()
  const credentials = Buffer.from(id + ':' + password).toString('base64')
  const response = await sandboxRequest('/api/links/' + linkId + '/', {
    headers: { Authorization: 'Basic ' + credentials, Accept: 'application/json' }
  }, 'verificar el vínculo')
  if (!response.ok) {
    await response.body?.cancel()
    if (response.status === 404) throw new HttpError(404, 'Belvo no encontró el vínculo.')
    throw new HttpError(502, 'Belvo no pudo verificar el vínculo (HTTP ' + response.status + ').')
  }

  const link = await response.json()
  if (link.id !== linkId || link.external_id !== externalIdFor(userId, password)) {
    throw new HttpError(403, 'El vínculo de Belvo no corresponde a este usuario.')
  }
  if (typeof link.institution !== 'string' || !link.institution) {
    throw new HttpError(502, 'Belvo no devolvió la institución del vínculo.')
  }
  return link
}

// Lee todas las páginas de un recurso para un único vínculo de Sandbox.
export async function listSandboxRecords(resource, linkId) {
  const { id, password } = sandboxCredentials()
  const credentials = Buffer.from(id + ':' + password).toString('base64')
  const headers = { Authorization: 'Basic ' + credentials, Accept: 'application/json' }
  const path = '/api/' + resource + '/'
  const origin = baseUrls.get('sandbox')
  let page = new URL(path, origin)
  page.search = new URLSearchParams({ link: linkId, page_size: '1000' })
  const visited = new Set()
  const records = []

  while (page) {
    // Valida cada destino antes de enviar las credenciales y detecta páginas repetidas.
    if (page.origin !== origin || page.pathname !== path ||
        page.username || page.password || page.searchParams.getAll('link').length !== 1 ||
        page.searchParams.get('link') !== linkId || visited.has(page.href)) {
      throw new HttpError(502, 'Belvo devolvió una página inválida de ' + resource + '.')
    }
    visited.add(page.href)
    const response = await sandboxRequest(page, { headers }, 'consultar ' + resource)
    if (!response.ok) {
      await response.body?.cancel()
      throw new HttpError(502, 'Belvo no pudo listar ' + resource + ' (HTTP ' + response.status + ').')
    }
    const { results, next } = await response.json()
    if (!Array.isArray(results) || (next !== null && typeof next !== 'string')) {
      throw new HttpError(502, 'Belvo devolvió un listado inválido de ' + resource + '.')
    }
    for (const record of results) records.push(record)
    page = next ? new URL(next, page) : null
  }

  return records
}
