// Controles de la página de prueba que se actualizan al iniciar sesión o importar datos.
const form = document.querySelector('#login')
const actions = document.querySelector('#actions')
const connect = document.querySelector('#connect')
const retry = document.querySelector('#retry')
const status = document.querySelector('#status')
const importPanel = document.querySelector('#import')
const links = document.querySelector('#links')
const sync = document.querySelector('#sync')
const importStatus = document.querySelector('#import-status')
const importData = document.querySelector('#import-data')
// La pestaña conserva la sesión y el vínculo pendiente durante el viaje de ida y vuelta a Belvo.
const sessionKey = 'fintrack.belvo.session'
const linkKey = 'fintrack.belvo.pendingLink'
let accessToken = sessionStorage.getItem(sessionKey)

// Lee el resultado del retorno, guarda el vínculo pendiente y limpia la URL visible.
const event = location.pathname.split('/').at(-1)
const link = new URLSearchParams(location.search).get('link')
if (event === 'success' && link) sessionStorage.setItem(linkKey, link)
if (event) history.replaceState(null, '', '/belvo-sandbox/')

// Alterna los controles de inicio de sesión, guardado e importación según el estado local.
function render() {
  form.hidden = Boolean(accessToken)
  actions.hidden = !accessToken
  retry.hidden = !sessionStorage.getItem(linkKey)
  importPanel.hidden = !accessToken
}

// Llama a la API local. Un cuerpo indica POST y un 401 con sesión obliga a iniciar sesión de nuevo.
async function request(path, body) {
  const headers = {}
  const options = { headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.method = 'POST'
    options.body = JSON.stringify(body)
  }
  if (accessToken) headers.Authorization = 'Bearer ' + accessToken
  const response = await fetch(path, options)
  const data = await response.json()
  if (response.status === 401 && accessToken) {
    accessToken = null
    sessionStorage.removeItem(sessionKey)
    render()
    throw new Error('Inicia sesión de nuevo para continuar.')
  }
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.')
  return data
}

// Envía el vínculo pendiente a Fintrack. Lo conserva para reintentar si el guardado falla.
async function saveLink() {
  const pending = sessionStorage.getItem(linkKey)
  if (!accessToken || !pending) return
  retry.disabled = true
  status.textContent = 'Verificando el vínculo con Belvo…'
  try {
    const result = await request('/api/belvo/links', { link: pending })
    sessionStorage.removeItem(linkKey)
    status.textContent = 'Vínculo guardado en Fintrack. Institución: ' + result.institution
    await refreshLinks(result.link)
  } catch (error) {
    status.textContent = error.message
  } finally {
    retry.disabled = false
    render()
  }
}

// Inicia sesión con la cuenta de Fintrack y restaura cualquier vínculo pendiente de la pestaña.
form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const submit = form.querySelector('button')
  submit.disabled = true
  try {
    const data = await request('/api/auth/login', Object.fromEntries(new FormData(form)))
    accessToken = data.session.access_token
    sessionStorage.setItem(sessionKey, accessToken)
    form.reset()
    render()
    status.textContent = 'Sesión iniciada.'
    await refreshLinks()
    await saveLink()
  } catch (error) {
    status.textContent = error.message
  } finally {
    submit.disabled = false
  }
})

// Pide al backend una URL con un token temporal y abre el widget en la misma pestaña.
connect.addEventListener('click', async () => {
  connect.disabled = true
  status.textContent = 'Solicitando acceso a Belvo…'
  try {
    const { url } = await request('/api/belvo/widget', {})
    location.assign(url)
  } catch (error) {
    status.textContent = error.message
    connect.disabled = false
  }
})

retry.addEventListener('click', saveLink)

// Construye la ruta local de una operación para el vínculo seleccionado.
function linkPath(linkId, operation) {
  return '/api/belvo/links/' + encodeURIComponent(linkId) + '/' + operation
}

// Reemplaza la lista existente e inserta los valores devueltos por la API como texto.
function renderList(selector, entries) {
  document.querySelector(selector).replaceChildren(...entries.map(entry => {
    const li = document.createElement('li')
    li.textContent = entry
    return li
  }))
}

// Formatea el número para lectores en Colombia e indica la moneda original de Belvo.
function formatAmount(amount, currency) {
  if (amount === null) return 'Saldo sin informar'
  const number = Number(amount).toLocaleString('es-CO', { maximumFractionDigits: 6 })
  return currency ? number + ' ' + currency : number + ' (moneda sin informar)'
}

// Muestra los totales guardados y su vista previa si todavía está seleccionado ese vínculo.
async function showImported(linkId) {
  importData.hidden = true
  if (!linkId) return
  const data = await request(linkPath(linkId, 'import'))
  if (links.value !== linkId || !accessToken) return
  document.querySelector('#accounts-count').textContent = 'Cuentas guardadas: ' + data.total_cuentas
  document.querySelector('#transactions-count').textContent = 'Movimientos guardados: ' + data.total_movimientos +
    (data.total_movimientos > data.movimientos.length ? ' (últimos ' + data.movimientos.length + ')' : '')
  renderList('#accounts-list', data.cuentas.map(account =>
    [account.nombre || account.tipo || 'Cuenta de prueba', formatAmount(account.saldo, account.moneda)].join(' · ')))
  renderList('#transactions-list', data.movimientos.map(item =>
    [item.fecha, item.descripcion || item.comercio || item.tipo, formatAmount(item.monto, item.moneda)].join(' · ')))
  importData.hidden = false
}

// Recarga los vínculos de la cuenta y selecciona el que se acaba de guardar cuando está disponible.
async function refreshLinks(selected) {
  sync.disabled = true
  try {
    const records = await request('/api/belvo/links')
    links.replaceChildren(...records.map(link => {
      const label = link.institucion + ' · ' + new Date(link.creado_en).toLocaleString('es-CO')
      return new Option(label, link.belvo_link_id)
    }))
    if (records.some(link => link.belvo_link_id === selected)) links.value = selected
    importStatus.textContent = links.value ? '' : 'Conecta un banco de prueba para importar sus datos.'
    await showImported(links.value)
  } catch (error) {
    importStatus.textContent = error.message
  } finally {
    sync.disabled = !links.value
  }
}

// Cambiar la selección consulta lo que ya está guardado en Supabase.
links.addEventListener('change', async () => {
  importStatus.textContent = ''
  try {
    await showImported(links.value)
  } catch (error) {
    importStatus.textContent = error.message
  }
})

// Importa el vínculo seleccionado y recarga la vista previa con los datos persistidos.
sync.addEventListener('click', async () => {
  const linkId = links.value
  if (!linkId) return
  sync.disabled = true
  links.disabled = true
  importStatus.textContent = 'Consultando Belvo Sandbox…'
  try {
    const result = await request(linkPath(linkId, 'sync'), {})
    importStatus.textContent = result.sin_datos_de_belvo
      ? 'Belvo aún no devuelve datos para este vínculo. Puedes volver a intentar con el mismo vínculo.'
      : result.cuentas + ' cuentas y ' + result.movimientos + ' movimientos sincronizados. ' +
        (result.cuentas_omitidas + result.movimientos_omitidos) + ' registros omitidos.'
    await showImported(linkId)
  } catch (error) {
    importStatus.textContent = error.message
  } finally {
    links.disabled = false
    sync.disabled = !links.value
  }
})

// Borra la sesión y los datos temporales de esta pestaña al cerrar sesión.
document.querySelector('#logout').addEventListener('click', () => {
  accessToken = null
  sessionStorage.removeItem(sessionKey)
  sessionStorage.removeItem(linkKey)
  links.replaceChildren()
  importData.hidden = true
  status.textContent = 'Sesión cerrada.'
  render()
})

// Muestra el resultado del retorno y recupera el estado cuando la pestaña ya tiene una sesión.
render()
if (event === 'exit') status.textContent = 'Saliste del widget antes de conectar el banco.'
if (event === 'error') status.textContent = 'Belvo informó un error durante la conexión.'
if (event === 'success') {
  status.textContent = link ? 'Inicia sesión para guardar el vínculo.' : 'Belvo no devolvió el identificador del vínculo.'
}
if (accessToken) void refreshLinks().then(saveLink)
