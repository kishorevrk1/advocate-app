import axios from 'axios'

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  reply: string
  citations?: string[]
  document?: { type: string; title: string; content: string }
  nextSteps?: string[]
  conversationId: string
}

export async function sendChatMessage(
  message: string,
  country: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  const response = await api.post('/api/chat/message', {
    message,
    country,
    messages: history,
  })
  return response.data
}
