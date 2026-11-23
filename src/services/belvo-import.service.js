import { createClient } from '@supabase/supabase-js'
import { HttpError } from '../lib/errors.js'
import { esFechaISO } from '../lib/dates.js'
import { esUUID } from '../lib/validators.js'
import { listSandboxRecords } from './belvo.service.js'

// Crea un cliente de servidor aislado para acceder a las tablas restringidas de Sandbox.
export function belvoSandboxDb() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )
}

// Registra el código de Supabase y traduce el fallo a un mensaje apto para la interfaz.
export function belvoDbResult({ data, error }, action) {
  if (error) {
    console.error('BELVO SANDBOX SUPABASE:', action, error.code)
    throw new HttpError(503, 'No se pudo ' + action + ' en Supabase. Revisa la migración y la clave del servidor.')
  }
  return data
}

// Devuelve el identificador guardado solo si el vínculo de Sandbox pertenece al usuario.
export async function ownedSandboxLink(db, userId, linkId) {
  if (!esUUID(linkId)) throw new HttpError(400, 'El identificador de Belvo debe ser un UUID.')
  const link = belvoDbResult(await db.from('belvo_links')
    .select('belvo_link_id')
    .eq('ambiente', 'sandbox')
    .eq('usuario_id', userId)
    .eq('belvo_link_id', linkId)
    .maybeSingle(), 'consultar el vínculo')
  if (!link) throw new HttpError(404, 'Vínculo de Belvo Sandbox no encontrado.')
  return link.belvo_link_id
}

// Conserva textos con contenido y convierte campos vacíos o de otro tipo en nulos.
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null
// Conserva únicamente códigos de moneda de tres letras mayúsculas.
const currency = value => typeof value === 'string' && /^[A-Z]{3}$/.test(value) ? value : null
// Belvo envía la dirección del movimiento por separado del monto.
const directions = new Map([['INFLOW', 'ingreso'], ['OUTFLOW', 'gasto']])

// Descarga, valida y guarda cuentas y movimientos. Devuelve totales y registros omitidos.
export async function importSandboxLink(db, userId, linkId) {
  const [accounts, transactions] = await Promise.all([
    listSandboxRecords('accounts', linkId),
    listSandboxRecords('transactions', linkId)
  ])

  // El identificador de Belvo agrupa cuentas repetidas y permite validar sus movimientos.
  const normalizedAccounts = new Map()
  for (const account of accounts) {
    if (!esUUID(account?.id) || account.link !== linkId) continue
    normalizedAccounts.set(account.id, {
      id: account.id,
      nombre: text(account.name) || text(account.institution?.name),
      tipo: text(account.category),
      moneda: currency(account.currency),
      saldo: Number.isFinite(account.balance?.current) ? account.balance.current : null
    })
  }

  // Solo se guardan movimientos válidos asociados a cuentas de esta importación.
  const normalizedTransactions = new Map()
  for (const transaction of transactions) {
    const accountId = transaction?.account?.id
    const tipo = directions.get(transaction?.type)
    if (!esUUID(transaction?.id) || !normalizedAccounts.has(accountId) || !tipo ||
        !Number.isFinite(transaction.amount) || transaction.amount < 0 || !esFechaISO(transaction.value_date)) {
      continue
    }
    normalizedTransactions.set(transaction.id, {
      id: transaction.id,
      cuenta_id: accountId,
      tipo,
      monto: transaction.amount,
      moneda: currency(transaction.currency),
      fecha: transaction.value_date,
      descripcion: text(transaction.description),
      comercio: text(transaction.merchant?.merchant_name),
      estado: text(transaction.status)
    })
  }

  // El procedimiento SQL guarda ambos recursos en una sola transacción.
  belvoDbResult(await db.rpc('import_belvo_sandbox', {
    p_usuario_id: userId,
    p_link_id: linkId,
    p_cuentas: [...normalizedAccounts.values()],
    p_movimientos: [...normalizedTransactions.values()]
  }), 'guardar la importación')

  return {
    cuentas: normalizedAccounts.size,
    movimientos: normalizedTransactions.size,
    cuentas_omitidas: accounts.length - normalizedAccounts.size,
    movimientos_omitidos: transactions.length - normalizedTransactions.size,
    sin_datos_de_belvo: !accounts.length && !transactions.length
  }
}
