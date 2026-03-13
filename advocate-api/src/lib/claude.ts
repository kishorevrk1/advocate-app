import Anthropic from '@anthropic-ai/sdk'
import { getLawsForCase } from '../data/laws'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface CaseInput {
  category: string
  description: string
  state: string
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
  const laws = getLawsForCase(input.state, input.category)
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const userMessage = `Analyze this consumer dispute and generate all required outputs:

**Case Details:**
- Category: ${input.category}
- State: ${input.state}
- Situation: ${input.description}
${input.opponentName ? `- Opposing party: ${input.opponentName}` : '- Opposing party: [Company/Person Name]'}
${input.amountDisputed ? `- Amount disputed: $${input.amountDisputed.toLocaleString()}` : ''}
${input.userName ? `- Claimant name: ${input.userName}` : '- Claimant name: [YOUR FULL NAME]'}
- Date: ${today}

**Applicable Laws to Reference:**
${laws.map(l => `• ${l}`).join('\n')}

Generate the complete demand letter, phone script, rights explanation, and escalation steps now.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  // Strip any markdown code blocks if Claude adds them despite instructions
  const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(jsonText) as CaseAnalysis
  } catch (parseError) {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonText.substring(0, 200)}`)
  }
}
