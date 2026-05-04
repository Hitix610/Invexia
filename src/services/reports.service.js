// Importa la función que obtiene las transacciones desde la capa de datos
import { getTransactionsService } from './transactions.service.js'

// Función principal que calcula el resumen financiero
export const getSummary = async () => {
  
  // Obtiene todas las transacciones disponibles
  const transactions = await getTransactionsService()

  // Inicializa los acumuladores de ingresos y gastos en cero
  let income = 0
  let expense = 0

  // Recorre cada transacción y la clasifica según su tipo
  transactions.forEach(t => {
    if (t.type === 'ingreso') {
      income += t.amount   // Suma al total de ingresos
    } else {
      expense += t.amount  // Suma al total de gastos
    }
  })

  // Retorna el resumen con ingresos, gastos y balance final
  return {
    income,
    expense,
    balance: income - expense  // Balance = ingresos - gastos
  }
}