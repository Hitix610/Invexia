import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// cargar variables de entorno
dotenv.config()

const app = express()

// middlewares básicos
app.use(cors())
app.use(express.json())

// ruta de prueba
app.get('/', (req, res) => {
  res.send('🚀 Fintrack backend funcionando')
})

// puerto
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})