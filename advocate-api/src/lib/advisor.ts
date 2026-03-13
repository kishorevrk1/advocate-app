import OpenAI from 'openai'
import { getLawsForCountry } from '../data/laws'

function getClient() {
  const useGroq = !!process.env.GROQ_API_KEY
  return {
    client: new OpenAI(
      useGroq
        ? { apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' }
        : { apiKey: process.env.ANTHROPIC_API_KEY, baseURL: 'https://api.anthropic.com/v1' }
    ),
    model: useGroq ? 'llama-3.3-70b-versatile' : 'claude-sonnet-4-6',
  }
}

const ADVISOR_SYSTEM = `You are Advocate, an AI legal advisor helping everyday people in India and the USA understand their rights and take action against unfair treatment.

Your approach:
1. If the situation is unclear, ask ONE focused clarifying question before giving full advice
2. Explain rights in plain, simple language — no legal jargon
3. Cite specific law sections (e.g. "Under Consumer Protection Act 2019, Section 35...")
4. Give a concrete recommended action: what to do first, what to do if that fails
5. Offer to draft a document (demand letter, consumer forum complaint, RTI, ombudsman letter, phone script) when relevant

India expertise: Consumer Protection Act 2019, RERA 2016, RBI Banking Ombudsman 2021, RTI Act 2005, TRAI regulations, IRDAI regulations, Payment of Wages Act, EPF Act, Industrial Disputes Act
USA expertise: State consumer laws, FDCPA, FCRA, CFPB Regulation E, DOT rules, FTC Act, small claims procedures

Rules:
- Never fabricate or guess law sections — only cite laws you are certain exist
- Always give specific deadlines (e.g. "file within 2 years", "report within 3 days")
- Be encouraging — most people CAN win these disputes with the right approach
- Keep responses concise — use line breaks for readability
- End with a clear next action or one follow-up question

IMPORTANT: Respond with valid JSON only — no markdown, no extra text:
{
  "reply": "your response in plain English (use \\n for line breaks)",
  "citations": ["specific law citation strings"] or [],
  "document": { "type": "letter|complaint|rti|script|ombudsman|rera", "title": "document title", "content": "full document text" } or null,
  "nextSteps": ["step 1", "step 2"] or null
}`

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatInput {
  message: string
  country: string
  history: ChatMessage[]
}

export interface ChatOutput {
  reply: string
  citations: string[]
  document: { type: string; title: string; content: string } | null
  nextSteps: string[] | null
}

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const laws = getLawsForCountry(input.country, 'general')

  const contextNote = laws.length
    ? `\n\n[User country: ${input.country}]\n[Relevant laws context:\n${laws.slice(0, 4).map(l => `• ${l}`).join('\n')}]`
    : `\n\n[User country: ${input.country}]`

  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...input.history,
    { role: 'user', content: input.message + contextNote },
  ]

  const { client, model: MODEL } = getClient()
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      { role: 'system', content: ADVISOR_SYSTEM },
      ...messages,
    ],
    response_format: { type: 'json_object' },
  })

  const text = response.choices[0]?.message?.content || ''
  const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(jsonText) as ChatOutput
  } catch {
    return { reply: text, citations: [], document: null, nextSteps: null }
  }
}
