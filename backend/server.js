// @ts-ignore
import express from 'express'
import cookieParser from 'cookie-parser'
import { connectDB } from './db/connectDB.js'
import authRoutes from './routes/auth.route.js'

const app = express()
app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT

app.get('/', (req, res) => {
  res.send('hello from simple server :)')
})

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  connectDB()
  console.info(`Server listen on port http://localhost:${PORT}`)
})
