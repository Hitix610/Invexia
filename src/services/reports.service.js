import { getTransactionsService } from './transactions.service.js'

export const getSummary = async () => {
  const transactions = await getTransactionsService()

  let income = 0
  let expense = 0

  transactions.forEach(t => {
    if (t.type === 'ingreso') {
      income += t.amount
    } else {
      expense += t.amount
    }
  })

  return {
    income,
    expense,
    balance: income - expense
  }
}