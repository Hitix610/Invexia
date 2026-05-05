/*services/transactions.service.js*/
/*get all transactions*/
export const getTransactionsService = async () => {
  return [
    { id: 1, amount: 50000, type: 'gasto' },
    { id: 2, amount: 200000, type: 'ingreso' }
  ]
}

/*------------------------------------------------------------------------------*/

/*services/transactions.service.js*/
/*post a new transaction*/
export const createTransactionService = async ({ amount, type }) => {
  const newTransaction = {
    id: Date.now(),
    amount,
    type
  }

  return newTransaction
}