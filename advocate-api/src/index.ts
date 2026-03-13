import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import generateRouter from './routes/generate'
import chatRouter from './routes/chat'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'advocate-api', timestamp: new Date().toISOString() })
})

app.use('/api/generate', generateRouter)
app.use('/api/chat', chatRouter)

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Advocate API running on port ${PORT}`)
})

export default app
