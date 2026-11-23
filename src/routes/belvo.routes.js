import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { HttpError, handleError } from '../lib/errors.js'
import { esUUID } from '../lib/validators.js'
import { createSandboxWidget, verifySandboxLink } from '../services/belvo.service.js'
import { belvoDbResult, belvoSandboxDb, importSandboxLink, ownedSandboxLink } from '../services/belvo-import.service.js'

// Rutas del widget y la importación, montadas bajo /api/belvo en Sandbox.
const router = Router()

// Todas las rutas requieren sesión de Fintrack y evitan cachear sus respuestas.
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
}, authMiddleware)

// Genera la URL del widget y configura las páginas de retorno para sus tres resultados.
router.post('/widget', async (req, res) => {
  try {
    const origin = process.env.BELVO_WIDGET_ORIGIN || ('http://localhost:' + (process.env.PORT || 3000))
    const callback = new URL('/belvo-sandbox/', origin)
    const callbackUrls = {
      success: new URL('success', callback).href,
      exit: new URL('exit', callback).href,
      event: new URL('error', callback).href
    }
    res.json({ url: await createSandboxWidget({ callbackUrls, userId: req.user.id }) })
  } catch (error) {
    handleError(res, error, 'BELVO WIDGET')
  }
})

// Comprueba en Belvo el vínculo recibido y lo guarda asociado al usuario autenticado.
router.post('/links', async (req, res) => {
  try {
    const linkId = req.body?.link
    if (!esUUID(linkId)) throw new HttpError(400, 'El identificador de Belvo debe ser un UUID.')

    const link = await verifySandboxLink(linkId.toLowerCase(), req.user.id)
    const admin = belvoSandboxDb()
    belvoDbResult(await admin.from('belvo_links').upsert({
      ambiente: 'sandbox',
      belvo_link_id: link.id,
      usuario_id: req.user.id,
      institucion: link.institution
    }, { onConflict: 'ambiente,belvo_link_id', ignoreDuplicates: true }), 'guardar el vínculo')
    res.json({ link: link.id, institution: link.institution })
  } catch (error) {
    handleError(res, error, 'BELVO LINKS')
  }
})

// Lista los vínculos de Sandbox guardados por este usuario, del más reciente al más antiguo.
router.get('/links', async (req, res) => {
  try {
    const db = belvoSandboxDb()
    const links = belvoDbResult(await db.from('belvo_links')
      .select('belvo_link_id,institucion,creado_en')
      .eq('ambiente', 'sandbox')
      .eq('usuario_id', req.user.id)
      .order('creado_en', { ascending: false }), 'listar los vínculos')
    res.json(links)
  } catch (error) {
    handleError(res, error, 'BELVO LINKS')
  }
})

// Importa el historial que Belvo ya tiene disponible para un vínculo del usuario.
router.post('/links/:id/sync', async (req, res) => {
  try {
    const db = belvoSandboxDb()
    const linkId = await ownedSandboxLink(db, req.user.id, req.params.id)
    res.json(await importSandboxLink(db, req.user.id, linkId))
  } catch (error) {
    handleError(res, error, 'BELVO IMPORT')
  }
})

// Devuelve los totales guardados y una vista previa de hasta 20 filas por recurso.
router.get('/links/:id/import', async (req, res) => {
  try {
    const db = belvoSandboxDb()
    const linkId = await ownedSandboxLink(db, req.user.id, req.params.id)
    const [accounts, transactions] = await Promise.all([
      db.from('belvo_sandbox_accounts').select('nombre,tipo,moneda,saldo', { count: 'exact' })
        .eq('belvo_link_id', linkId).order('belvo_account_id').limit(20),
      db.from('belvo_sandbox_transactions').select('fecha,tipo,monto,moneda,descripcion,comercio,estado', { count: 'exact' })
        .eq('belvo_link_id', linkId).order('fecha', { ascending: false }).order('belvo_transaction_id').limit(20)
    ])
    res.json({
      cuentas: belvoDbResult(accounts, 'leer las cuentas importadas'),
      movimientos: belvoDbResult(transactions, 'leer los movimientos importados'),
      total_cuentas: accounts.count,
      total_movimientos: transactions.count
    })
  } catch (error) {
    handleError(res, error, 'BELVO IMPORT')
  }
})

export default router
