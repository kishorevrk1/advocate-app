import OpenAI from 'openai'
import { getLawsForCase, getLawsForCountry } from '../data/laws'

// Lazy client — reads env vars at call time (after dotenv.config() has run)
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

export interface CaseInput {
  category: string
  description: string
  state: string
  country?: string   // 'US' | 'IN' | 'OTHER' — defaults to 'US'
  opponentName?: string
  amountDisputed?: number
  userName?: string
}

export interface PhoneScript {
  opening: string
  negotiation: string
  pushback: string
  escalation: string
}

export interface CaseAnalysis {
  rights: string[]
  applicable_laws: string[]
  demand_letter: string
  phone_script: PhoneScript
  next_steps: string[]
  estimated_recovery: string
}

const SYSTEM_PROMPT = `You are Advocate, an AI-powered consumer rights information tool that helps everyday people understand their rights and draft professional communications.

IMPORTANT DISCLAIMER: Always position your output as informational only. Include this in demand letters: "This letter was prepared using publicly available legal information. It does not constitute legal advice. For complex matters, consult a licensed attorney."

You must respond with ONLY valid JSON — no markdown code blocks, no extra text before or after, no explanations. Return exactly this structure:
{
  "rights": ["array of user's specific rights in plain English, 3-5 items"],
  "applicable_laws": ["array of specific law citations with section numbers, 3-5 items"],
  "demand_letter": "complete professional demand letter as a single string with \\n for line breaks",
  "phone_script": {
    "opening": "exact words to say when they answer the phone (2-3 sentences)",
    "negotiation": "how to clearly state your case and what you want (3-4 sentences)",
    "pushback": "what to say when they push back or refuse (3-4 sentences)",
    "escalation": "final escalation threat language referencing complaints and legal action (2-3 sentences)"
  },
  "next_steps": ["ordered array of 4 escalation steps if letter fails"],
  "estimated_recovery": "realistic estimate of what they can recover (be specific with dollar amounts if applicable)"
}

Write demand letters in formal business letter format. Be direct, professional, and reference specific laws. Phone scripts should sound natural and confident, not robotic. Never fabricate laws — only cite real laws from the context provided.`

export async function analyzeCase(input: CaseInput): Promise<CaseAnalysis> {
  const country = (input.country || 'US').toUpperCase()
  const laws = country === 'IN'
    ? getLawsForCountry('IN', input.category)
    : getLawsForCase(input.state, input.category)

  const isIndia = country === 'IN'
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const locationLabel = isIndia ? `State: ${input.state}, India` : `State: ${input.state}, USA`
  const currencySymbol = isIndia ? '₹' : '$'

  const userMessage = `Analyze this consumer dispute and generate all required outputs:

**Case Details:**
- Category: ${input.category}
- Location: ${locationLabel}
- Situation: ${input.description}
${input.opponentName ? `- Opposing party: ${input.opponentName}` : '- Opposing party: [Company/Person Name]'}
${input.amountDisputed ? `- Amount disputed: ${currencySymbol}${input.amountDisputed.toLocaleString()}` : ''}
${input.userName ? `- Claimant name: ${input.userName}` : '- Claimant name: [YOUR FULL NAME]'}
- Date: ${today}

**Applicable Laws to Reference:**
${laws.map(l => `• ${l}`).join('\n')}

Generate the complete demand letter, phone script, rights explanation, and escalation steps now. Use ${isIndia ? 'Indian legal formatting and ₹ currency' : 'US legal formatting and $ currency'}.`

  const { client, model: MODEL } = getClient()
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
  })

  const text = response.choices[0]?.message?.content || ''
  const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(jsonText) as CaseAnalysis
  } catch (parseError) {
    throw new Error(`Failed to parse response as JSON: ${jsonText.substring(0, 200)}`)
  }
}
