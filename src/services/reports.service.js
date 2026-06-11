// Importamos la función que obtiene las transacciones.
// Esta función viene de transactions.service.js
// y devuelve todas las transacciones disponibles.
import { getTransactionsService } from './transactions.service.js'


// Creamos y exportamos una función llamada getSummary.
// "async" significa que puede esperar resultados usando "await".
export const getSummary = async () => {

  // Llamamos a la función que trae las transacciones
  // y guardamos el resultado en la variable "transactions".
  const transactions = await getTransactionsService()

  console.log(transactions)
  // Creamos una variable para guardar el total de ingresos.
  // Empieza en 0 porque todavía no hemos sumado nada.
  let income = 0


  // Creamos una variable para guardar el total de gastos.
  // También empieza en 0.
  let expense = 0


  // Recorremos todas las transacciones una por una.
  // "t" representa cada transacción individual.
  transactions.forEach(t => {

    // Revisamos si la transacción es de tipo "ingreso"
    if (t.type === 'ingreso') {

      // Si es ingreso, sumamos el monto al total de ingresos
      // Ejemplo: income = income + t.amount
      income += t.amount

    }

    // Si la transacción es de tipo "gasto"
    else if (t.type === 'gasto') {

      // Sumamos el monto al total de gastos
      expense += t.amount
    }
  })


  // Cuando terminamos de recorrer todas las transacciones,
  // devolvemos un objeto con el resumen financiero.
  return {

    // Total de ingresos
    income,

    // Total de gastos
    expense,

    // Balance final:
    // ingresos menos gastos
    balance: income - expense
  }
}