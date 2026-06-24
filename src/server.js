import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reportsRoutes from './routes/reports.routes.js'
import transactionsRoutes from './routes/transactions.routes.js'
import semaforoRoutes from './routes/semaforo.routes.js'
import budgetsRoutes from './routes/budgets.routes.js'
// cargar variables de entorno
dotenv.config()

const app = express()

// middlewares básicos (deben ir ANTES de las rutas)
app.use(cors())
app.use(express.json())


// rutas
app.use('/api/reports', reportsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/semaforo', semaforoRoutes)
app.use('/api/budgets', budgetsRoutes)

// ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Fintrack backend funcionando')
})

// puerto
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})