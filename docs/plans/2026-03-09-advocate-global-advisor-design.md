# Advocate 3.0 — Global Legal Advisor Design Document
**Date:** 2026-03-09
**Status:** Approved
**Scope:** Global expansion (India + USA), AI Legal Advisor tab, Template Library, redesigned onboarding

---

## Vision

Advocate is the legal GPS for everyday people — not just Americans.

Millions of people in India and the USA get cheated every year (landlords, banks, e-commerce, employers, builders) and never fight back because they don't know their rights, can't afford a lawyer, and don't know what to say or send. Advocate fills the gap between "Google it" and "hire a lawyer."

**What makes Advocate different from Google + ChatGPT:**

| Generic AI/Search | Advocate |
|---|---|
| "You may have rights under..." | "Under Consumer Protection Act 2019 §35, you can claim refund + ₹10,000 compensation" |
| Generic text | Ready-to-send letter with YOUR name, their name, and real law citations |
| One answer, no memory | Tracks your case — "It's been 15 days, time to escalate to Consumer Forum" |
| Same for everyone | India Consumer Forum process vs RERA vs Banking Ombudsman vs US small claims |
| No documents | Demand letter, consumer complaint, RTI application — generated and ready to send |

---

## User Journey

### New user (downloads app)

```
1. Onboarding Screen 1 — Global hero: "Millions get cheated. Most never fight back."
2. Onboarding Screen 2 — Show what they get: Letter + Script + Strategy
3. Onboarding Screen 3 — Country select (India / USA / Other) + email sign-up
4. Home — Template categories + "Start New Case" CTA
5. Advisor tab — AI chat for any legal question
```

### Returning user with an open case

```
Home → sees case status → gets escalation nudge → taps →
Advisor chat pre-loaded with case context →
"They didn't reply. Here's your Consumer Forum complaint, ready to file."
```

---

## Architecture: Multi-Agent AI Pipeline

Every user interaction (structured case OR free chat) runs through the same agent pipeline:

```
User input
    ↓
[Intake Agent]
  - Asks 2-3 clarifying questions if needed
  - Detects country from user profile or text cues
  - Identifies: problem type, opponent, amount, jurisdiction
    ↓
[Rights Agent]
  - Loads jurisdiction-specific law database (India or USA)
  - Returns: applicable laws, user rights, deadlines, penalties
    ↓
[Strategy Agent]
  - Calculates: escalation path (step 1 → step 2 → step 3)
  - Success probability based on case type + jurisdiction
  - Recommended immediate action
    ↓
[Document Agent]
  - Drafts one or more documents based on stage:
    * Demand letter / email
    * Consumer Forum complaint
    * Banking Ombudsman complaint
    * RERA complaint
    * RTI application
    * Phone script
    ↓
[Escalation Agent] (async, runs on schedule)
  - Watches open cases
  - Pushes notification when deadline reached
  - Prepares next-step document automatically
```

The difference from ChatGPT: each agent has a **specific job** and a **structured output**. The user gets documents, not conversations.

---

## Screen Designs

### Onboarding Screen 1 (replaces USA-only hero)

- Background: Deep navy `#0B1120` with gold radial glow
- Headline: **"Millions of people get cheated every year. Most never fight back."**
- Sub: "Withheld deposits. Denied refunds. Builder fraud. Subscription traps. You have rights."
- Dual stat row (glass card):
  - 🇮🇳 ₹47,000 avg consumer dispute (India)
  - 🇺🇸 $480 avg consumer dispute (USA)
- Badge: `⚡ AI-POWERED · INDIA + USA`
- CTA: gold gradient pill — "Get My Rights →"

### Onboarding Screen 2 (what you get — replaces category picker)

- Headline: **"Your case. Your letter. In 60 seconds."**
- 3 feature cards (glass, horizontal scroll):
  - 📝 **Demand Letter** — "Professional legal letter with real law citations. Ready to send."
  - 📞 **Phone Script** — "Know exactly what to say, word for word."
  - 📬 **Complaint Filing** — "Consumer Forum, Banking Ombudsman, RERA — we guide you through it."
- Works for row: `🇮🇳 India` · `🇺🇸 USA` · `🌍 More countries soon`
- CTA: "See How It Works →"

### Onboarding Screen 3 (country + sign-up — replaces old onboarding 3)

- Headline: **"Where are you based?"**
- Country selector: large cards with flags
  - 🇮🇳 India — Consumer Protection, RERA, Banking Ombudsman, RTI
  - 🇺🇸 USA — Tenant rights, FDCPA, DOT rules, small claims
  - 🌍 Other — General consumer rights guidance
- Below: email input + "Get Started Free →"
- Sub: "No credit card · 1 free case · Takes 10 seconds"

### Home Screen (updated)

- Same Deep Navy + Gold design
- Header: ShieldLogo + "Advocate" + country flag chip (🇮🇳 or 🇺🇸, tappable to change)
- Stat cards: Active / Recovered / Won (unchanged)
- **Template Quick-Access row** (NEW — horizontal scroll):
  - 📝 Demand Letter · 📬 Consumer Forum · 🏦 Bank Complaint · 🏠 RERA · 📋 RTI · ✈️ Flight
- New Case CTA (unchanged)
- Active cases list (unchanged)

### New "Advisor" Tab (4th tab in bottom bar)

Icon: `chatbubble-ellipses` (Ionicons), label: "Advisor"

**Chat interface:**
- Header: ShieldLogo + "Legal Advisor" + country flag
- AI greeting (country-aware):
  - India: "Hi! I'm your legal advisor. Tell me what happened — I'll explain your rights and get your documents ready. Works for consumer disputes, bank fraud, RERA, RTI, and more."
  - USA: "Hi! I'm your legal advisor. Tell me what happened — I'll identify your rights and draft your demand letter or complaint in minutes."
- Message bubbles: user = gold-tinted right, AI = navy glass left
- AI responses include:
  - Text explanation (plain English)
  - Collapsible law citations block (gold border)
  - Inline document card (tap to expand full letter/script)
  - "What to do next" step chips
- **Template chips** (horizontal scroll above keyboard):
  - [📝 Demand Letter] [📞 Phone Script] [📬 Consumer Forum] [🏦 Bank Ombudsman] [🏠 RERA] [📋 RTI]
  - Tap any chip → AI pre-fills context and generates that document
- **Case context awareness**: if user has open cases, AI knows about them
  - "Based on your Amazon dispute — you sent the letter 18 days ago. They haven't replied. Ready to escalate to Consumer Forum? I can prepare the complaint now."

### Updated Tab Bar

```
[ Home ] [ My Cases ] [ Advisor ] [ Settings ]
   🏠       💼          💬           ⚙️
```

---

## India Law Database

New section in `advocate-api/src/data/laws.ts` — India-specific laws by category:

### Categories (India)

```
ecommerce    — Amazon/Flipkart refund disputes, non-delivery
banking      — UPI fraud, unauthorized transactions, loan issues, credit card disputes
realestate   — Builder delays, deposit refund, RERA violations
telecom      — Billing disputes (Jio/Airtel/Vi), service issues
insurance    — Claim denial (health, vehicle, life)
employer     — Unpaid salary, PF/EPF issues, wrongful termination
government   — RTI applications, government service denial
consumer     — General consumer disputes (any product/service)
```

### Key India Laws (per category)

**ecommerce:**
- Consumer Protection Act 2019, Section 2(34): E-commerce entity defined, liable for deficiency
- Consumer Protection (E-Commerce) Rules 2020: Mandatory refund within 7 days of return pickup
- Consumer Protection Act 2019, Section 35: File complaint at District Consumer Commission (free)
- IT Act 2000, Section 43A: Data protection and compensation for negligence

**banking:**
- RBI Banking Ombudsman Scheme 2006 (updated 2021): Free, binding resolution within 30 days
- Payment and Settlement Systems Act 2007: UPI/NEFT fraud liability on bank if reported within 3 days
- RBI Circular RBI/2017-18/15: Zero liability for unauthorized transactions if reported within 3 days
- Banking Ombudsman can award up to ₹20 lakh compensation
- Credit Information Companies Regulation Act 2005: Credit report errors — bank must correct in 30 days

**realestate:**
- RERA Act 2016, Section 18: Builder must refund entire amount + interest (SBI MCLR + 2%) for delays
- RERA Act 2016, Section 31: File complaint at State RERA Authority (online)
- RERA Act 2016, Section 40: Penalty up to 10% of project cost for violations
- Consumer Protection Act 2019: Builder can be sued at Consumer Forum regardless of RERA filing

**telecom:**
- TRAI Act 1997: File complaint at TRAI Consumer Complaint (consumercomplaints.trai.gov.in)
- Telecom Consumer Protection Regulations 2012: Billing disputes must be resolved in 30 days
- TRAI Quality of Service Regulations: Service failure entitles refund of proportional charges
- Consumer Forum jurisdiction: Available for all telecom disputes

**insurance:**
- Insurance Ombudsman Rules 2017: Free, binding, resolves in 90 days
- IRDAI (Protection of Policyholders' Interests) Regulations 2017: Claim decision within 30 days
- Consumer Protection Act 2019: File at Consumer Forum for claim denial + mental agony compensation
- IRDAI Circular 2015/436: Insurer cannot reject claim citing pre-existing disease without declaring it

**employer:**
- Payment of Wages Act 1936: Wages must be paid by 7th of following month (10th for >1000 employees)
- Employees' Provident Funds Act 1952: EPF must be deposited within 15 days; file at EPFO portal
- Industrial Disputes Act 1947: Wrongful termination — file at Labour Commissioner
- Maternity Benefit Act 1961: 26 weeks maternity leave mandatory

**government (RTI):**
- Right to Information Act 2005, Section 6: File RTI online at rtionline.gov.in (₹10 fee)
- RTI Act, Section 7: Response mandatory within 30 days (48 hours for life/liberty matters)
- RTI Act, Section 19: First appeal to senior officer if no reply within 30 days
- RTI Act, Section 18: Second appeal to Central/State Information Commission (free)

**consumer (general):**
- Consumer Protection Act 2019, Section 35: District Consumer Commission — disputes up to ₹1 crore (free to file)
- Consumer Protection Act 2019, Section 47: State Commission — disputes ₹1 crore to ₹10 crore
- Consumer Protection Act 2019, Section 49: National Commission — disputes above ₹10 crore
- Limitation period: 2 years from date of cause of action
- Compensation: Refund + interest + ₹10,000–₹50,000 for mental agony (standard awards)

---

## Backend Changes Required

### New API Endpoints

**1. POST `/api/chat/message`**
```
Request: { message, conversationId?, country, caseContext? }
Response: { reply, citations?, document?, nextSteps?, conversationId }
```
Multi-turn conversational AI. Maintains message history per conversation. Country-aware.

**2. GET `/api/templates`**
```
Response: { categories: [{ id, name, emoji, country, description }] }
```
Returns template categories for the template browser.

**3. POST `/api/templates/generate`**
```
Request: { templateType, country, userDetails: {...} }
Response: { document: string, citations: string[] }
```
Generates a specific template (RTI, consumer forum complaint, etc.) from user details.

**4. POST `/api/document/pdf`** (Pro feature)
```
Request: { content, title, type }
Response: { pdfBase64 }
```
Converts document text to formatted PDF for download/share.

### Updated `laws.ts`

Add `IN` (India) section with all categories above. Add `getLawsForCountry(country, category)` function alongside existing `getLawsForCase(state, category)`.

### Updated System Prompt for Chat

New system prompt for `/api/chat/message` — conversational mode:
- Ask 2-3 clarifying questions before answering
- Detect country if not in profile
- Provide plain-English rights explanation
- Always include specific law citations
- Offer to generate a document at the end
- Know escalation paths for India (Consumer Forum → State Commission → National Commission) and USA (demand letter → complaint agency → small claims)

---

## Database Schema (Supabase)

The existing `cases` table is missing — causing the runtime error. Full schema required:

```sql
-- Cases table
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  description TEXT NOT NULL,
  state TEXT,
  opponent_name TEXT,
  amount_disputed DECIMAL,
  status TEXT DEFAULT 'active',  -- active, resolved, closed
  outcome TEXT,                  -- won, lost, settled, pending
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table (letters, scripts, complaints)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- letter, script, complaint, rti, pdf
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Escalation steps
CREATE TABLE escalation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat conversations (for Advisor tab)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),  -- nullable: linked case if any
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

CREATE POLICY "Users see own cases" ON cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own docs" ON documents FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own escalations" ON escalation_steps FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
```

---

## Monetization

### Free Tier
- 1 complete case analysis (letter + phone script + rights + escalation plan)
- Browse all template categories (see examples, not personalized)
- AI Advisor chat — 3 messages per day
- View analysis results

### Pro — $9.99/month or $49.99/year
- Unlimited cases (India + USA)
- Unlimited AI Advisor chat
- PDF download (formatted, professional)
- WhatsApp share (1-tap share of letter/complaint)
- Case tracking + push notification reminders ("15 days since letter — escalate now?")
- All jurisdiction templates (Consumer Forum, Banking Ombudsman, RERA, RTI)
- Priority AI response

### Paywall triggers
- After 1st case is used: prompt Pro on case creation
- When tapping PDF download
- After 3 Advisor messages in a day
- When tapping a "Pro" template chip

---

## UX Rules

1. **Value before friction** — User sees what they get on onboarding before any sign-up ask
2. **Documents over conversations** — Every AI interaction ends with a ready-to-use document, not just text
3. **Plain English first, legal citations second** — Explanation in simple language, citations collapsible
4. **One action per screen** — Don't overwhelm; each step has one clear CTA
5. **Country-aware from first screen** — Never show USA-specific content to Indian users
6. **WhatsApp as the share default** — India users share via WhatsApp, not email or copy
7. **Offline template browsing** — Template categories loadable without network; personalization needs network
8. **Gold = action/urgency** — Gold color used for CTAs and important deadlines (not decoration)

---

## Phased Implementation

### Phase 1 — Foundation (database + backend)
- Fix Supabase schema (create all 4 tables)
- Add India law database to `laws.ts`
- New `/api/chat/message` endpoint (multi-turn conversational AI)
- New `/api/templates` endpoint

### Phase 2 — App screens
- Redesign Onboarding screens 1–3 (global hero, country select)
- Add Advisor tab (4th tab, chat UI)
- Update Home with template quick-access row
- Update tab bar to 4 tabs

### Phase 3 — Pro features
- PDF generation endpoint + in-app PDF viewer
- WhatsApp share integration (React Native Share API)
- Push notifications for case escalation reminders
- Update Paywall screen with new Pro features list

---

## Success Metrics

- **Day 1 retention**: User creates a case or sends a message on day 1
- **Core action rate**: % of users who generate at least 1 document
- **Pro conversion**: % of free users who hit a paywall and convert
- **India adoption**: % of new signups selecting India as country
- **Case resolution**: % of cases marked "won" or "resolved" by user
