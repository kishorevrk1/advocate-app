import { Router, Request, Response } from 'express'
import { chat, ChatMessage } from '../lib/advisor'

const router = Router()

router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, country, messages } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ error: 'message is required' })
    }

    const history: ChatMessage[] = Array.isArray(messages) ? messages : []
    const result = await chat({
      message: message.trim(),
      country: (country as string) || 'US',
      history,
    })

    res.json({
      ...result,
      conversationId: `conv_${Date.now()}`,
    })
  } catch (error: any) {
    console.error('Chat error:', error.message)
    res.status(500).json({ error: 'Failed to process message. Please try again.' })
  }
})

export default router
