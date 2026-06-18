// Importamos la función que obtiene las transacciones
import { getTransactionsService } from './transactions.service.js'

// ==========================================
// RESUMEN FINANCIERO
// ==========================================
export const getSummary = async () => {

  const transactions = await getTransactionsService()

  let income = 0
  let expense = 0

  transactions.forEach(t => {

    if (t.tipo === 'ingreso') {
      income += Number(t.monto)
    }

    else if (t.tipo === 'gasto') {
      expense += Number(t.monto)
    }
  })

  return {
    income,
    expense,
    balance: income - expense
  }
}

// ==========================================
// GASTOS POR CATEGORÍA
// ==========================================
export const getExpensesByCategory = async () => {

  const transactions = await getTransactionsService()

  // Objeto donde agruparemos los gastos
  const categories = {}

  transactions.forEach(t => {

    // Solo analizamos gastos
    if (t.tipo === 'gasto') {

      // Si no tiene categoría mostramos "Sin categoría"
      const category = t.categoria_id || 'Sin categoría'

      // Si la categoría no existe la iniciamos en 0
      if (!categories[category]) {
        categories[category] = 0
      }

      // Sumamos el monto
      categories[category] += Number(t.monto)
    }
  })

  // Convertimos el objeto a arreglo
  return Object.entries(categories).map(([categoria, total]) => ({
    categoria,
    total
  }))
}