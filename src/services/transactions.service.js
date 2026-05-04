/*services/transactions.service.js*/
export const getTransactionsService = async () => {
  return [
    { id: 1, amount: 50000, type: 'gasto' },
    { id: 2, amount: 200000, type: 'ingreso' }
  ]
}

/*------------------------------------------------------------------------------*/

/*CONECTAR EN server.js*/
//import transactionsRoutes from './routes/transactions.routes.js'

//app.use('/transactions', transactionsRoutes)