# Advocate 3.0 — Global Legal Advisor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Advocate into a global legal advisor for India + USA — add a multi-turn AI chat tab, India law database, country selection in onboarding, and template quick-access across the app.

**Architecture:** Three layers: (1) Backend — new `/api/chat/message` endpoint + India law database added to existing `laws.ts`; (2) App core — `src/lib/country.ts` stores user's country in AsyncStorage, `src/api/advisor.ts` calls the chat endpoint; (3) Screens — redesigned onboarding (global hero + feature showcase + country select), new AdvisorScreen, updated AppNavigator (4 tabs), updated HomeScreen.

**Tech Stack:** React Native + Expo, Express + TypeScript backend, Anthropic claude-sonnet-4-6, @react-native-async-storage/async-storage (already installed), @expo/vector-icons Ionicons, expo-linear-gradient, react-native-reanimated

---

## Context for every task

- App: `E:/new_apps/advocate` (React Native + Expo)
- Backend: `E:/new_apps/advocate-api` (Express + TypeScript)
- Design system: Deep Navy (`#0B1120`) + Gold (`#C9A84C`) — all colors in `src/theme/colors.ts`
- Existing tabs: Home, My Cases, Settings — adding Advisor as 4th tab
- Onboarding flow: Screen1 → Screen2 → Screen3 → Paywall → Auth → Main app
- `OnboardingNavigator.tsx` manages step state for onboarding
- `@react-native-async-storage/async-storage` is already installed
- Backend already uses Anthropic SDK (`claude-sonnet-4-6`)
- No git in this repo — skip all git steps

---

## Phase 1: Backend

### Task 1: Fix Supabase database schema

**Files:**
- No code files — manual SQL step in Supabase dashboard

**Step 1: Open Supabase SQL editor**

Go to https://supabase.com → project `yczrpkzzbtfaoqvilqva` → SQL Editor → New query

**Step 2: Run this SQL**

```sql
-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  description TEXT NOT NULL,
  state TEXT,
  opponent_name TEXT,
  amount_disputed DECIMAL,
  status TEXT DEFAULT 'active',
  outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Escalation steps
CREATE TABLE IF NOT EXISTS escalation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations (for Advisor tab chat history)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  country TEXT NOT NULL DEFAULT 'US',
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own cases" ON cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own docs" ON documents FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
);
CREATE POLICY "Users own steps" ON escalation_steps FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
);
CREATE POLICY "Users own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
```

**Step 3: Verify**

Run in SQL Editor: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
Expected output includes: `cases`, `documents`, `escalation_steps`, `conversations`

---

### Task 2: Add India law database to backend

**Files:**
- Modify: `advocate-api/src/data/laws.ts`

**Step 1: Read the current file**

Read `E:/new_apps/advocate-api/src/data/laws.ts` — it currently has `stateLaws` for US states and a `getLawsForCase` function.

**Step 2: Add India laws + getLawsForCountry at the bottom of the file**

Append after the existing `getLawsForCase` function:

```typescript
// ── India law database ──────────────────────────────────────────────────────

export const indiaLaws: Record<string, string[]> = {
  ecommerce: [
    'Consumer Protection Act 2019, Section 2(34): E-commerce entity liable for deficiency of service',
    'Consumer Protection (E-Commerce) Rules 2020: Refund mandatory within 7 days of return pickup',
    'Consumer Protection Act 2019, Section 35: File complaint at District Consumer Commission (free to file, no lawyer needed)',
    'IT Act 2000, Section 43A: Compensation for negligence causing wrongful loss to consumer data',
  ],
  banking: [
    'RBI Banking Ombudsman Scheme 2021: Free, binding resolution within 30 days, up to ₹20 lakh compensation',
    'RBI Circular 2017 (DBR.No.Leg.BC.78): Zero customer liability for unauthorized transactions reported within 3 days',
    'Payment and Settlement Systems Act 2007: Bank liable for UPI/NEFT fraud if customer not negligent',
    'Credit Information Companies Regulation Act 2005: Bank must correct credit report errors within 30 days',
  ],
  realestate: [
    'RERA Act 2016, Section 18: Builder must refund entire amount + interest (SBI MCLR + 2%) for project delays',
    'RERA Act 2016, Section 31: Complaint at State RERA Authority — file online, no lawyer required',
    'RERA Act 2016, Section 40: Penalty up to 10% of project cost for violations',
    'Consumer Protection Act 2019: Consumer Forum jurisdiction available alongside RERA for builder disputes',
  ],
  telecom: [
    'TRAI Act 1997: File complaint at consumercomplaints.trai.gov.in',
    'Telecom Consumer Protection Regulations 2012: Billing disputes must be resolved within 30 days',
    'TRAI Quality of Service Regulations 2017: Service failure entitles proportional refund of charges',
    'Consumer Protection Act 2019: Consumer Forum jurisdiction for all telecom disputes',
  ],
  insurance: [
    'Insurance Ombudsman Rules 2017: Free, binding resolution within 90 days (claims up to ₹30 lakh)',
    'IRDAI (Protection of Policyholders Interests) Regulations 2017: Claim decision mandatory within 30 days',
    'Consumer Protection Act 2019: Consumer Forum for compensation beyond claim amount + mental agony',
    'IRDAI Circular 2015/436: Insurer cannot reject claim for pre-existing disease not declared at inception',
  ],
  employer: [
    'Payment of Wages Act 1936: Wages must be paid by 7th of following month (10th if over 1000 employees)',
    'Employees Provident Funds Act 1952: EPF must be deposited within 15 days — file complaint at epfindia.gov.in',
    'Industrial Disputes Act 1947, Section 25F: Wrongful termination without notice — file at Labour Commissioner',
    'Maternity Benefit Act 1961: 26 weeks mandatory maternity leave — employer cannot deny or terminate',
  ],
  government: [
    'Right to Information Act 2005, Section 6: File RTI online at rtionline.gov.in (fee: ₹10)',
    'RTI Act 2005, Section 7: Response mandatory within 30 days (48 hours for matters affecting life or liberty)',
    'RTI Act 2005, Section 19: First appeal to senior officer if no reply within 30 days — free',
    'RTI Act 2005, Section 18: Second appeal to Central/State Information Commission — free, binding',
  ],
  consumer: [
    'Consumer Protection Act 2019, Section 35: District Consumer Commission — disputes up to ₹1 crore (free to file)',
    'Consumer Protection Act 2019, Section 47: State Commission — ₹1 crore to ₹10 crore',
    'Consumer Protection Act 2019, Section 57: National Commission — above ₹10 crore',
    'Limitation period: 2 years from date of cause of action to file complaint',
    'Standard compensation: Refund + interest + ₹10,000–₹50,000 for mental agony (Consumer Forum awards)',
  ],
  general: [
    'Consumer Protection Act 2019: Covers all goods and services — District Consumer Forum is free to file',
    'RBI Banking Ombudsman Scheme 2021: All bank and UPI disputes — free, resolves in 30 days',
    'RERA Act 2016: All registered real estate projects — builder delays entitle full refund + interest',
    'RTI Act 2005: Any government information available — file online at rtionline.gov.in for ₹10',
  ],
}

/**
 * Get laws for a given country and category.
 * For US, delegates to the existing state-based getLawsForCase.
 * For India, returns from indiaLaws.
 */
export function getLawsForCountry(country: string, category: string): string[] {
  if (country === 'IN') {
    return indiaLaws[category] || indiaLaws['general'] || []
  }
  // For US (and default): return federal laws for the category
  return stateLaws['FEDERAL'][category] || []
}
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate-api && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

### Task 3: Create chat API — lib and route

**Files:**
- Create: `advocate-api/src/lib/advisor.ts`
- Create: `advocate-api/src/routes/chat.ts`
- Modify: `advocate-api/src/index.ts`

**Step 1: Create `src/lib/advisor.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk'
import { getLawsForCountry } from '../data/laws'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: ADVISOR_SYSTEM,
    messages,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(jsonText) as ChatOutput
  } catch {
    // Graceful fallback if Claude doesn't return valid JSON
    return { reply: content.text, citations: [], document: null, nextSteps: null }
  }
}
```

**Step 2: Create `src/routes/chat.ts`**

```typescript
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
```

**Step 3: Register the chat route in `src/index.ts`**

Add after the existing `app.use('/api/generate', generateRouter)` line:

```typescript
import chatRouter from './routes/chat'
// ... (add after generateRouter line)
app.use('/api/chat', chatRouter)
```

The updated `index.ts` should look like:
```typescript
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

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Advocate API running on port ${PORT}`)
})

export default app
```

**Step 4: Verify TypeScript**

```bash
cd E:/new_apps/advocate-api && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

**Step 5: Test the endpoint manually**

Start the backend: `cd E:/new_apps/advocate-api && npm run dev`

In a new terminal:
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"My Amazon order never arrived and they refused my refund","country":"IN","messages":[]}'
```
Expected: JSON response with `reply`, `citations`, `nextSteps` fields

---

## Phase 2: App Core

### Task 4: Country storage + advisor API client

**Files:**
- Create: `advocate/src/lib/country.ts`
- Create: `advocate/src/api/advisor.ts`

**Step 1: Create `src/lib/country.ts`**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Country = 'IN' | 'US' | 'OTHER'

const KEY = 'advocate_country'

export async function getCountry(): Promise<Country> {
  const stored = await AsyncStorage.getItem(KEY)
  return (stored as Country) || 'US'
}

export async function setCountry(country: Country): Promise<void> {
  await AsyncStorage.setItem(KEY, country)
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  IN:    '🇮🇳',
  US:    '🇺🇸',
  OTHER: '🌍',
}

export const COUNTRY_NAMES: Record<Country, string> = {
  IN:    'India',
  US:    'USA',
  OTHER: 'Global',
}
```

**Step 2: Create `src/api/advisor.ts`**

```typescript
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
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

## Phase 3: Onboarding Redesign

### Task 5: Redesign OnboardingScreen1 — global hero

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen1.tsx`

**Step 1: Read the current file first**

**Step 2: Replace the file entirely with:**

```typescript
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, Dimensions, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, FadeInDown
} from 'react-native-reanimated'
import { colors } from '../../theme/colors'
import { GradientButton, ShieldLogo } from '../../components/ui'

const { height } = Dimensions.get('window')

interface Props { onNext: () => void }

export default function OnboardingScreen1({ onNext }: Props) {
  const badgeOpacity = useSharedValue(0)
  const badgeY = useSharedValue(-12)

  useEffect(() => {
    badgeOpacity.value = withDelay(300, withTiming(1, { duration: 700 }))
    badgeY.value = withDelay(300, withSpring(0, { damping: 18 }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }))

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F1E3A', '#0B1120', '#080C14']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
      />
      <View style={styles.glow} />

      <SafeAreaView style={styles.inner}>
        {/* Logo + badge */}
        <Animated.View style={[styles.logoRow, badgeStyle]}>
          <ShieldLogo size={36} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ AI-POWERED · INDIA + USA</Text>
          </View>
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.heroBlock}>
          <Text style={styles.heroTop}>Millions of people get</Text>
          <Text style={styles.heroAmount}>cheated.</Text>
          <Text style={styles.heroBottom}>Most never fight back.</Text>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(600).duration(600)} style={styles.body}>
          Withheld deposits. Denied refunds. Builder fraud. Bank fraud. Subscription traps.{' '}
          <Text style={styles.bodyBold}>You have rights. We help you use them.</Text>
        </Animated.Text>

        {/* Dual stat row — India + USA */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statFlag}>🇮🇳</Text>
            <Text style={styles.statNum}>₹47,000</Text>
            <Text style={styles.statLabel}>avg consumer{'\n'}dispute (India)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statFlag}>🇺🇸</Text>
            <Text style={styles.statNum}>$480</Text>
            <Text style={styles.statLabel}>avg consumer{'\n'}dispute (USA)</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statFlag}>⚡</Text>
            <Text style={styles.statNum}>60s</Text>
            <Text style={styles.statLabel}>to get your{'\n'}letter ready</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.cta}>
          <GradientButton label="Get My Rights →" onPress={onNext} />
          <Text style={styles.ctaSub}>Free to try · Works in India & USA</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  inner:     { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  glow: {
    position: 'absolute',
    top: height * 0.18, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(201,168,76,0.07)',
  },
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40 },
  badge: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.30)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  badgeText:  { color: colors.goldBright, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  heroBlock:  { marginBottom: 20 },
  heroTop:    { fontSize: 22, fontWeight: '600', color: colors.textSecondary, marginBottom: 2 },
  heroAmount: { fontSize: 60, fontWeight: '900', color: colors.goldPrimary, letterSpacing: -2, lineHeight: 68 },
  heroBottom: { fontSize: 22, fontWeight: '600', color: colors.textSecondary },
  body:       { fontSize: 16, color: colors.textSecondary, lineHeight: 26, marginBottom: 32 },
  bodyBold:   { color: colors.text, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 'auto' as any,
  },
  statItem:   { alignItems: 'center', flex: 1 },
  statFlag:   { fontSize: 20, marginBottom: 6 },
  statNum:    { fontSize: 18, fontWeight: '900', color: colors.goldBright, marginBottom: 4 },
  statLabel:  { fontSize: 10, color: colors.textMuted, textAlign: 'center', lineHeight: 14 },
  statDivider:{ width: 1, backgroundColor: colors.border, marginVertical: 8 },
  cta:        { paddingBottom: 24 },
  ctaSub:     { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
})
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

### Task 6: Redesign OnboardingScreen2 — "What you get" feature showcase

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen2.tsx`

**Step 1: Read the current file** (it's currently a category picker — this changes to a feature showcase)

**Step 2: Replace the file entirely with:**

```typescript
import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { GradientButton, GlassCard } from '../../components/ui'

const FEATURES = [
  {
    emoji: '📝',
    title: 'Demand Letter',
    desc: 'Professional legal letter with real law citations. Ready to send in 60 seconds.',
    gradient: colors.gradientGold as [string, string, string],
  },
  {
    emoji: '📞',
    title: 'Phone Script',
    desc: 'Know exactly what to say, word for word. Opening, negotiation, escalation.',
    gradient: ['#00B4D8', '#0090B5', '#006A8A'] as [string, string, string],
  },
  {
    emoji: '📬',
    title: 'Complaint Filing',
    desc: 'Consumer Forum, Banking Ombudsman, RERA, RTI — we guide you through the exact process.',
    gradient: ['#32D74B', '#26A83B', '#1A7D2B'] as [string, string, string],
  },
]

const COUNTRIES = ['🇮🇳 India', '🇺🇸 USA', '🌍 More soon']

interface Props { onNext: (category: string) => void }

export default function OnboardingScreen2({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F1E3A', colors.bgScreen]}
        style={styles.topGrad}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.step}>WHAT YOU GET</Text>
            <Text style={styles.title}>Your case.{'\n'}Your letter.{'\n'}In 60 seconds.</Text>
          </Animated.View>

          {FEATURES.map((f, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 120 + 300).duration(500)}>
              <GlassCard style={styles.card}>
                <LinearGradient
                  colors={f.gradient}
                  style={styles.iconBox}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.emoji}>{f.emoji}</Text>
                </LinearGradient>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{f.title}</Text>
                  <Text style={styles.cardDesc}>{f.desc}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          ))}

          <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.countryRow}>
            <Text style={styles.countryLabel}>Works for</Text>
            <View style={styles.countryChips}>
              {COUNTRIES.map((c, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(900).duration(500)}>
            <GradientButton label="Continue →" onPress={() => onNext('')} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bgScreen },
  topGrad:      { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  safe:         { flex: 1 },
  content:      { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  step:         { fontSize: 11, color: colors.goldPrimary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title:        { fontSize: 36, fontWeight: '900', color: colors.text, lineHeight: 44, marginBottom: 32 },
  card:         { flexDirection: 'row', alignItems: 'flex-start', padding: 18, marginBottom: 14 },
  iconBox:      { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 },
  emoji:        { fontSize: 24 },
  cardText:     { flex: 1 },
  cardTitle:    { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 5 },
  cardDesc:     { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  countryRow:   { marginBottom: 28 },
  countryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 10 },
  countryChips: { flexDirection: 'row', gap: 8 },
  chip:         { backgroundColor: colors.bgElevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  chipText:     { fontSize: 13, color: colors.text, fontWeight: '500' },
})
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

### Task 7: Redesign OnboardingScreen3 — country select + how we work

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen3.tsx`

**Step 1: Read the current file** (it's "here's how we fight for you" — we're adding country selection at the top and saving it)

**Step 2: Replace the file entirely with:**

```typescript
import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { GlassCard, GradientButton } from '../../components/ui'
import { setCountry, Country } from '../../lib/country'

const COUNTRIES: { code: Country; flag: string; name: string; tagline: string }[] = [
  { code: 'IN', flag: '🇮🇳', name: 'India',  tagline: 'Consumer Forum · RERA · Banking Ombudsman · RTI' },
  { code: 'US', flag: '🇺🇸', name: 'USA',    tagline: 'Consumer rights · FDCPA · DOT rules · Small claims' },
  { code: 'OTHER', flag: '🌍', name: 'Other', tagline: 'General consumer rights guidance' },
]

const HOW_IT_WORKS = [
  { emoji: '⚖️', title: 'Know Your Rights',  desc: 'We identify which laws apply to your exact situation', gradient: colors.gradientGold as [string,string,string] },
  { emoji: '📝', title: 'Draft Your Letter',  desc: 'Professional demand letter with legal citations in 60 seconds', gradient: ['#00B4D8','#0090B5','#006A8A'] as [string,string,string] },
  { emoji: '🎯', title: 'Track to Victory',   desc: 'Step-by-step escalation path — from letter to Consumer Forum to win', gradient: ['#32D74B','#26A83B','#1A7D2B'] as [string,string,string] },
]

interface Props { onNext: () => void }

export default function OnboardingScreen3({ onNext }: Props) {
  const [selected, setSelected] = useState<Country>('IN')

  const handleContinue = async () => {
    await setCountry(selected)
    onNext()
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={styles.step}>STEP 2 OF 2</Text>
          <Text style={styles.title}>Where are you based?</Text>
          <Text style={styles.sub}>We'll use laws specific to your country.</Text>
        </Animated.View>

        {/* Country selector */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.countryList}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c.code}
              onPress={() => setSelected(c.code)}
              activeOpacity={0.85}
            >
              <GlassCard
                style={styles.countryCard}
                gold={selected === c.code}
                glow={selected === c.code ? colors.goldPrimary : undefined}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <View style={styles.countryText}>
                  <Text style={[styles.countryName, selected === c.code && styles.countryNameSelected]}>
                    {c.name}
                  </Text>
                  <Text style={styles.countryTagline}>{c.tagline}</Text>
                </View>
                {selected === c.code && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </GlassCard>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* How it works */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          {HOW_IT_WORKS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <LinearGradient colors={s.gradient} style={styles.stepIcon} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={styles.stepEmoji}>{s.emoji}</Text>
              </LinearGradient>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.footer}>
          <GradientButton label="See Pricing →" onPress={handleContinue} />
          <Text style={styles.disclaimer}>
            ℹ️ Advocate provides legal information, not legal advice.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: colors.bgScreen },
  inner:               { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  step:                { fontSize: 11, color: colors.goldPrimary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title:               { fontSize: 30, fontWeight: '900', color: colors.text, lineHeight: 38, marginBottom: 6 },
  sub:                 { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  countryList:         { gap: 10, marginBottom: 28 },
  countryCard:         { flexDirection: 'row', alignItems: 'center', padding: 16 },
  countryFlag:         { fontSize: 28, marginRight: 14 },
  countryText:         { flex: 1 },
  countryName:         { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
  countryNameSelected: { color: colors.goldBright },
  countryTagline:      { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  checkCircle:         { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.goldPrimary, alignItems: 'center', justifyContent: 'center' },
  checkIcon:           { color: colors.bgScreen, fontSize: 13, fontWeight: '800' },
  sectionLabel:        { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 14 },
  stepRow:             { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepIcon:            { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  stepEmoji:           { fontSize: 20 },
  stepText:            { flex: 1 },
  stepTitle:           { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc:            { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  footer:              { marginTop: 'auto' as any },
  disclaimer:          { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 14, lineHeight: 18 },
})
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

### Task 8: Update OnboardingNavigator — remove unused category state

**Files:**
- Modify: `advocate/src/navigation/OnboardingNavigator.tsx`

**Step 1: Read the current file**

**Step 2: Replace with cleaned-up version** (removes unused `selectedCategory` state since Screen2 no longer passes a category):

```typescript
import React, { useState } from 'react'
import { View } from 'react-native'
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1'
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2'
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3'
import PaywallScreen from '../screens/PaywallScreen'
import { useAuthStore } from '../store/authStore'

export default function OnboardingNavigator() {
  const [step, setStep] = useState(0)
  const { setHasSeenOnboarding } = useAuthStore()

  const completeOnboarding = () => {
    setHasSeenOnboarding(true)
  }

  const screens = [
    <OnboardingScreen1 key="s1" onNext={() => setStep(1)} />,
    <OnboardingScreen2 key="s2" onNext={() => setStep(2)} />,
    <OnboardingScreen3 key="s3" onNext={() => setStep(3)} />,
    <PaywallScreen key="s4" onSuccess={completeOnboarding} onSkip={completeOnboarding} />,
  ]

  return <View style={{ flex: 1 }}>{screens[step]}</View>
}
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

## Phase 4: Advisor Tab

### Task 9: Add Advisor tab to AppNavigator

**Files:**
- Modify: `advocate/src/navigation/AppNavigator.tsx`

**Step 1: Read the current file**

**Step 2: Add AdvisorScreen import and 4th tab**

The current `TAB_ICONS` only has 3 entries. Add `Advisor` to it and add the screen import.

Changes needed:
1. Add import: `import AdvisorScreen from '../screens/AdvisorScreen'`
2. Add to `TabName` union: `| 'Advisor'`
3. Add to `TAB_ICONS`: `Advisor: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' }`
4. Add tab screen: `<Tab.Screen name="Advisor" component={AdvisorScreen} options={{ tabBarLabel: 'Advisor' }} />`

Updated file:

```typescript
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import MyCasesScreen from '../screens/MyCasesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AdvisorScreen from '../screens/AdvisorScreen'
import NewCaseScreen from '../screens/NewCaseScreen'
import CaseAnalysisScreen from '../screens/CaseAnalysisScreen'
import DemandLetterScreen from '../screens/DemandLetterScreen'
import PhoneScriptScreen from '../screens/PhoneScriptScreen'
import OutcomeTrackerScreen from '../screens/OutcomeTrackerScreen'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']
type TabName = 'Home' | 'MyCases' | 'Advisor' | 'Settings'

const TAB_ICONS: Record<TabName, { active: IoniconName; inactive: IoniconName }> = {
  Home:     { active: 'home',                    inactive: 'home-outline' },
  MyCases:  { active: 'briefcase',               inactive: 'briefcase-outline' },
  Advisor:  { active: 'chatbubble-ellipses',      inactive: 'chatbubble-ellipses-outline' },
  Settings: { active: 'settings',                inactive: 'settings-outline' },
}

const tabScreenOptions = ({ route }: { route: { name: string } }) => ({
  headerShown: false,
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor:   colors.goldPrimary,
  tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
  tabBarLabelStyle: styles.tabLabel,
  tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
    const icons = TAB_ICONS[route.name as TabName]
    if (!icons) return null
    const name = focused ? icons.active : icons.inactive
    return (
      <View style={styles.iconWrap}>
        {focused && <View style={styles.activeIndicator} />}
        <Ionicons name={name} size={size} color={color} />
      </View>
    )
  },
})

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyCases"  component={MyCasesScreen}  options={{ tabBarLabel: 'My Cases' }} />
      <Tab.Screen name="Advisor"  component={AdvisorScreen}  options={{ tabBarLabel: 'Advisor' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"           component={HomeTabs} />
      <Stack.Screen name="NewCase"        component={NewCaseScreen} />
      <Stack.Screen name="CaseAnalysis"   component={CaseAnalysisScreen} />
      <Stack.Screen name="DemandLetter"   component={DemandLetterScreen} />
      <Stack.Screen name="PhoneScript"    component={PhoneScriptScreen} />
      <Stack.Screen name="OutcomeTracker" component={OutcomeTrackerScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8,12,20,0.97)',
    borderTopColor:  'rgba(201,168,76,0.20)',
    borderTopWidth:  1,
    height:          68,
    paddingBottom:   10,
    paddingTop:      6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  activeIndicator: {
    position:        'absolute',
    top:             0,
    width:           32,
    height:          3,
    borderRadius:    2,
    backgroundColor: colors.goldPrimary,
  },
  tabLabel: {
    fontSize:   11,
    fontWeight: '600' as const,
  },
})
```

**Step 3: Note** — `AdvisorScreen` doesn't exist yet. TypeScript will error until Task 10 creates it. Run TypeScript check AFTER Task 10.

---

### Task 10: Create AdvisorScreen

**Files:**
- Create: `advocate/src/screens/AdvisorScreen.tsx`

**Step 1: Create the file with this content:**

```typescript
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import { ShieldLogo } from '../components/ui'
import { sendChatMessage, ChatMessage } from '../api/advisor'
import { getCountry, COUNTRY_FLAGS, COUNTRY_NAMES, Country } from '../lib/country'

const TEMPLATE_CHIPS = [
  { id: 'letter',   label: '📝 Demand Letter',  message: 'I need help drafting a demand letter for my dispute.' },
  { id: 'phone',    label: '📞 Phone Script',    message: 'I need a phone script to call and resolve my dispute.' },
  { id: 'consumer', label: '📬 Consumer Forum',  message: 'I want to file a Consumer Forum complaint. Can you guide me?' },
  { id: 'bank',     label: '🏦 Bank Ombudsman',  message: 'I want to file a Banking Ombudsman complaint for my issue.' },
  { id: 'rera',     label: '🏠 RERA Complaint',  message: 'I want to file a RERA complaint against my builder.' },
  { id: 'rti',      label: '📋 RTI Application', message: 'I want to file an RTI application. How do I do it?' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  citations?: string[]
  document?: { type: string; title: string; content: string }
  nextSteps?: string[]
}

function greeting(country: Country): string {
  if (country === 'IN') {
    return 'Hi! I\'m your legal advisor.\n\nTell me what happened — I\'ll explain your rights and get your documents ready.\n\nI can help with consumer disputes, bank/UPI fraud, RERA complaints, RTI, telecom issues, insurance claims, and more.'
  }
  return 'Hi! I\'m your legal advisor.\n\nTell me what happened — I\'ll identify your rights and draft your demand letter or complaint in minutes.\n\nI can help with security deposits, unauthorized charges, flight cancellations, unpaid invoices, defective products, and more.'
}

export default function AdvisorScreen() {
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [country, setCountry]         = useState<Country>('US')
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    getCountry().then(c => {
      setCountry(c)
      setMessages([{ id: 'greeting', role: 'assistant', text: greeting(c) }])
    })
  }, [])

  const apiHistory = (): ChatMessage[] =>
    messages
      .filter(m => m.id !== 'greeting')
      .map(m => ({ role: m.role, content: m.text }))

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(trimmed, country, apiHistory())
      const aiMsg: Message = {
        id:        `a_${Date.now()}`,
        role:      'assistant',
        text:      res.reply,
        citations: res.citations,
        document:  res.document ?? undefined,
        nextSteps: res.nextSteps ?? undefined,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        id:   `err_${Date.now()}`,
        role: 'assistant',
        text: 'Something went wrong. Please check your connection and try again.',
      }])
    }

    setLoading(false)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)
  }

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user'
    return (
      <Animated.View
        key={msg.id}
        entering={isUser ? FadeInRight.duration(250) : FadeInLeft.duration(250)}
        style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <ShieldLogo size={22} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {msg.text}
          </Text>

          {msg.citations && msg.citations.length > 0 && (
            <View style={styles.citationsBlock}>
              <Text style={styles.citationsTitle}>⚖️ Legal basis</Text>
              {msg.citations.map((c, i) => (
                <Text key={i} style={styles.citationText}>• {c}</Text>
              ))}
            </View>
          )}

          {msg.document && (
            <View style={styles.docCard}>
              <View style={styles.docIconBox}>
                <Text style={styles.docEmoji}>
                  {msg.document.type === 'letter' ? '📝' :
                   msg.document.type === 'script' ? '📞' :
                   msg.document.type === 'rti'    ? '📋' : '📬'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{msg.document.title}</Text>
                <Text style={styles.docSub}>Document ready · Tap to view</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.goldPrimary} />
            </View>
          )}

          {msg.nextSteps && msg.nextSteps.length > 0 && (
            <View style={styles.stepsBlock}>
              <Text style={styles.stepsTitle}>Next steps</Text>
              {msg.nextSteps.map((s, i) => (
                <Text key={i} style={styles.stepText}>{i + 1}. {s}</Text>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F1E3A', colors.bgScreen]}
        style={styles.topGrad}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <ShieldLogo size={28} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Legal Advisor</Text>
            <Text style={styles.headerSub}>
              {COUNTRY_FLAGS[country]} {COUNTRY_NAMES[country]} · AI-powered
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(renderMessage)}

            {loading && (
              <Animated.View entering={FadeInLeft.duration(250)} style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.avatar}><ShieldLogo size={22} /></View>
                <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={colors.goldPrimary} />
                  <Text style={styles.typingText}>Analyzing...</Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Template chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chips}
            contentContainerStyle={styles.chipsContent}
          >
            {TEMPLATE_CHIPS.map(chip => (
              <TouchableOpacity
                key={chip.id}
                style={styles.chip}
                onPress={() => send(chip.message)}
                disabled={loading}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask any legal question..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={() => send(input)}
              disabled={!input.trim() || loading}
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            >
              <LinearGradient
                colors={colors.gradientGold as [string, string, string]}
                style={styles.sendGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="send" size={18} color={colors.bgScreen} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bgScreen },
  flex:            { flex: 1 },
  topGrad:         { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  safe:            { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  headerText:      { flex: 1 },
  headerTitle:     { fontSize: 17, fontWeight: '700', color: colors.goldBright },
  headerSub:       { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  liveBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 4 },
  liveText:        { fontSize: 10, fontWeight: '700', color: colors.success, letterSpacing: 0.5 },
  messages:        { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
  msgRow:          { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:      { justifyContent: 'flex-end' },
  msgRowAI:        { justifyContent: 'flex-start' },
  avatar:          { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  bubble:          { maxWidth: '78%', borderRadius: 18, padding: 14 },
  bubbleUser:      { backgroundColor: 'rgba(201,168,76,0.18)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.30)', borderBottomRightRadius: 4 },
  bubbleAI:        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText:      { fontSize: 15, color: colors.text, lineHeight: 22 },
  bubbleTextUser:  { color: colors.goldBright },
  citationsBlock:  { marginTop: 12, backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 10, padding: 10, borderLeftWidth: 2, borderLeftColor: colors.goldPrimary },
  citationsTitle:  { fontSize: 11, fontWeight: '700', color: colors.goldPrimary, marginBottom: 6, letterSpacing: 0.5 },
  citationText:    { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 2 },
  docCard:         { marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.borderBright },
  docIconBox:      { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  docEmoji:        { fontSize: 18 },
  docTitle:        { fontSize: 13, fontWeight: '600', color: colors.text },
  docSub:          { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  stepsBlock:      { marginTop: 12, backgroundColor: colors.bgElevated, borderRadius: 10, padding: 10 },
  stepsTitle:      { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  stepText:        { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 2 },
  typingBubble:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText:      { fontSize: 13, color: colors.textMuted },
  chips:           { maxHeight: 50, borderTopWidth: 1, borderTopColor: colors.border },
  chipsContent:    { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip:            { backgroundColor: colors.bgElevated, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  chipText:        { fontSize: 12, color: colors.text, fontWeight: '500' },
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgBase, gap: 8 },
  input:           { flex: 1, backgroundColor: colors.bgCard, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn:         { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendGradient:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
```

**Step 2: Verify TypeScript (both Tasks 9 + 10 together)**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors

---

## Phase 5: Home Screen Update

### Task 11: Add template quick-access chips + country flag to HomeScreen

**Files:**
- Modify: `advocate/src/screens/HomeScreen.tsx`

**Step 1: Read the current file**

**Step 2: Make these targeted additions**

A. Add imports at top:
```typescript
import { getCountry, COUNTRY_FLAGS, Country } from '../lib/country'
```

B. Add state after existing state declarations:
```typescript
const [country, setCountry] = useState<Country>('US')
```

C. Add to the existing `useFocusEffect`:
```typescript
useFocusEffect(useCallback(() => {
  load()
  getCountry().then(setCountry)   // ← add this line
}, []))
```

D. After the `tagline` Text in the header section, update the logoRow to show country flag:
Change the existing `appName` Text from:
```typescript
<Text style={styles.appName}>Advocate</Text>
```
To:
```typescript
<View style={styles.appNameRow}>
  <Text style={styles.appName}>Advocate</Text>
  <View style={styles.countryChip}>
    <Text style={styles.countryChipText}>{COUNTRY_FLAGS[country]}</Text>
  </View>
</View>
```

E. Add a template quick-access row BETWEEN the stats row and the new case CTA. Insert after `</Animated.View>` that closes the statsRow block:

```typescript
{/* Template quick-access */}
<Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.templateRow}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateChips}>
    {[
      { label: '📝 Demand Letter' },
      { label: '📬 Consumer Forum' },
      { label: '🏦 Bank Ombudsman' },
      { label: '🏠 RERA' },
      { label: '📋 RTI' },
      { label: '✈️ Flight' },
    ].map((t, i) => (
      <TouchableOpacity
        key={i}
        style={styles.templateChip}
        onPress={() => navigation.navigate('Tabs', { screen: 'Advisor' })}
      >
        <Text style={styles.templateChipText}>{t.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</Animated.View>
```

F. Add to the StyleSheet at the bottom:
```typescript
appNameRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
countryChip:       { backgroundColor: colors.bgElevated, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
countryChipText:   { fontSize: 14 },
templateRow:       { marginBottom: 20 },
templateChips:     { gap: 8 },
templateChip:      { backgroundColor: colors.bgElevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
templateChipText:  { fontSize: 12, color: colors.text, fontWeight: '500' },
```

**Step 3: Verify TypeScript**

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

## Final Verification

After all tasks, run a full TypeScript check:

```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1
cd E:/new_apps/advocate-api && npx tsc --noEmit 2>&1
```

Both should produce **zero output** (zero errors).

Then restart the Expo dev server:
```bash
cd E:/new_apps/advocate && npx expo start --clear
```

### What should work after all tasks:

- [ ] Onboarding Screen 1: Global hero with India + USA flags and dual stats
- [ ] Onboarding Screen 2: "What you get" feature cards (letter, script, complaint)
- [ ] Onboarding Screen 3: Country selector (India / USA / Other) — saves to AsyncStorage
- [ ] Bottom tab bar: 4 tabs — Home, My Cases, **Advisor**, Settings
- [ ] Advisor tab: chat interface with AI legal advisor, template chips
- [ ] Advisor sends messages to `/api/chat/message` and gets structured replies
- [ ] Advisor shows law citations inline (collapsible gold border block)
- [ ] Advisor shows document cards when AI generates a letter/complaint
- [ ] Home screen: country flag chip in header, template quick-access chips row
- [ ] Tapping any template chip on Home navigates to Advisor tab
- [ ] Database: all 4 tables exist in Supabase (no more "cases table not found" error)
