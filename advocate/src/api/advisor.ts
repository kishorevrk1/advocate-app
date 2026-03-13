import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL

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
  const response = await axios.post(`${API_URL}/api/chat/message`, {
    message,
    country,
    messages: history,
  })
  return response.data
}
