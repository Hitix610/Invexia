import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reportsRoutes from './routes/reports.routes.js'
import transactionsRoutes from './routes/transactions.routes.js'
import semaforoRoutes from './routes/semaforo.routes.js'
import budgetsRoutes from './routes/budgets.routes.js'
import authRoutes from './routes/auth.routes.js'
import goalsRoutes from './routes/goals.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import remindersRoutes from './routes/reminders.routes.js'
import profileRoutes from './routes/profile.routes.js'
import educationRoutes from './routes/education.routes.js'

// cargar variables de entorno
dotenv.config()

const app = express()

// middlewares básicos
app.use(cors())
app.use(express.json())

// rutas
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/transactions', transactionsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/semaforo', semaforoRoutes)
app.use('/api/budgets', budgetsRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/reminders', remindersRoutes)
app.use('/api/education', educationRoutes)

// ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Invexia backend funcionando')
})

// ruta no encontrada (responde JSON en vez del HTML por defecto de Express)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// errores generales, por ejemplo un JSON mal formado en el body
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' })
  }

  console.error('ERROR NO CONTROLADO:', err.message)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// puerto
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
