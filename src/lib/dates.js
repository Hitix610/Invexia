const pad = (n) => String(n).padStart(2, '0')

// Fecha de hoy (YYYY-MM-DD) en hora de Colombia, no en UTC
export const hoyBogota = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

export const mesActualBogota = () => {
  const [anio, mes] = hoyBogota().split('-').map(Number)
  return { mes, anio }
}

// Rango [desde, hasta) de un mes: desde = día 1, hasta = día 1 del mes siguiente
export const rangoMes = (mes, anio) => {
  const sigMes = mes === 12 ? 1 : mes + 1
  const sigAnio = mes === 12 ? anio + 1 : anio

  return {
    desde: `${anio}-${pad(mes)}-01`,
    hasta: `${sigAnio}-${pad(sigMes)}-01`
  }
}

// Valida formato YYYY-MM-DD y que la fecha exista (rechaza 2026-02-31)
export const esFechaISO = (valor) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false
  }

  const d = new Date(`${valor}T00:00:00Z`)
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valor
}
