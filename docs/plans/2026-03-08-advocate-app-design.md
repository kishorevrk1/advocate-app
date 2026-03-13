# Advocate App — Design Document
**Date:** 2026-03-08
**Status:** Approved
**Platform:** Android-first (cross-platform via React Native + Expo)
**Budget:** $25 (Google Play one-time registration fee)

---

## Overview

**Advocate** is an AI-powered mobile app that helps everyday people resolve consumer disputes without lawyers. Users describe their problem in plain English, and Advocate identifies their legal rights, drafts professional demand letters, generates phone call scripts, and tracks escalation steps to resolution.

**Tagline:** *"Know your rights. Fight back. Win."*

**Core human desire tapped:** Money + Fairness (highest purchase motivation)

**Why now:** DoNotPay collapsed in 2023-2024, vacating this category. No mobile-first consumer rights app with strong AI exists in 2026.

---

## Monetization

| Tier | Price | Included |
|---|---|---|
| Free | $0 | 1 case, 1 demand letter preview (blurred after line 3), basic script |
| Pro | $9.99/month | Unlimited cases, full PDFs, all scripts, escalation tracker |
| Annual | $69.99/year | Same as Pro, 40% savings |

- **Strategy:** Hard paywall after first case value is demonstrated
- **Paywall triggers:** Download PDF, open second case, access phone script
- **7-day free trial** on annual plan
- **RevenueCat** handles all Android billing and subscription analytics
- Target conversion: 12.1% (hard paywall benchmark per RevenueCat SOSA 2025)

---

## Onboarding Flow (5 Screens)

1. **Hook** — "Americans lose $300–800/year to unfair charges. Get it back."
2. **Social Proof** — "$2.3M recovered for our users this month" + star ratings
3. **Personalization** — "What's your situation?" (select dispute category)
4. **Promise** — "We'll tell you your rights + draft your letter in 60 seconds"
5. **Paywall** — 7-day free trial, then $9.99/month or $69.99/year

Connor's rules applied:
- Invoke emotion (Screen 1)
- Show strongest incentives (Screen 2)
- Personalization (Screen 3)
- Scientific credibility (recovery stats, law citations)

---

## Case Categories at Launch (5)

1. Security deposit disputes
2. Unauthorized charges / subscription traps
3. Airline / travel refunds (EC 261, DOT rules)
4. Unpaid freelance invoices
5. Defective product / denied returns

---

## Core Features

### 1. Case Builder (AI)
- User describes situation in plain English (text + voice input)
- Selects their US state (for state-specific law matching)
- AI identifies: applicable laws, user rights, what they're owed, who's liable
- Outputs: demand letter + phone script + escalation path
- Powered by Claude API (claude-sonnet-4-6)

### 2. Demand Letter Generator
- Professionally formatted letter with legal citations
- Personalized to opponent name, amount, situation
- Downloadable as PDF
- Shareable via email / WhatsApp / print
- Disclaimer: "This is an informational tool, not legal advice"

### 3. Phone Script Generator
- Stage-by-stage call script (opening, negotiation, pushback, escalation)
- Includes "I am recording this call" language
- CFPB / state AG complaint threat language
- Tailored to specific company type + dispute category

### 4. Outcome Tracker
- Case timeline with logged actions
- 4-step escalation path:
  - Step 1: Send demand letter (certified mail)
  - Step 2: Chargeback / bank dispute
  - Step 3: CFPB / State AG / BBB complaint
  - Step 4: Small claims court filing guide
- User logs outcome → app suggests next step
- "Total Recovered" counter (gamification + social proof)

---

## Screen Map

```
App
├── Onboarding (5 screens) → Paywall
│
├── Home / Dashboard
│   ├── Active cases
│   ├── Total recovered counter
│   └── New case CTA
│
├── New Case Flow
│   ├── Category select
│   ├── Situation input (text/voice)
│   ├── State selector
│   ├── AI analysis (loading → results)
│   ├── Your Rights summary
│   └── Action picker (Letter / Script / Track)
│
├── Demand Letter
│   ├── Preview + edit
│   ├── Download PDF
│   └── Share / Email / Print
│
├── Phone Script
│   ├── Script by stage
│   ├── Pushback responses
│   └── Escalation language
│
├── Outcome Tracker
│   ├── Case timeline
│   ├── Next step suggestion
│   ├── Log outcome
│   └── Escalation path
│
├── My Cases
│   ├── All cases list
│   ├── Won / Pending / Escalated filter
│   └── Total recovered
│
└── Settings
    ├── Subscription (RevenueCat)
    ├── Profile
    └── Notifications
```

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Mobile | React Native + Expo | Cross-platform, Android-first, fast iteration |
| Backend | Node.js + Express | Simple REST API |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, row-level security |
| AI | Claude API (claude-sonnet-4-6) | Best for legal language + document generation |
| Subscriptions | RevenueCat | Android billing, analytics, free tier |
| Auth | Supabase Auth | Google sign-in + email |
| Storage | Supabase Storage | PDFs, uploaded documents |
| PDF | React Native HTML to PDF | Professional demand letter output |
| Notifications | Expo Push Notifications | Case reminders, escalation nudges |
| Analytics | Mixpanel | Onboarding funnel, conversion tracking |
| Hosting | Railway.app | Free tier backend hosting |

---

## Architecture

```
Mobile App (Expo)
      │
      │ REST API
      ▼
Backend (Node.js + Railway)
  /api/cases     → case CRUD
  /api/generate  → Claude API calls
  /api/letters   → PDF generation
  /api/scripts   → phone script generation
  /api/escalate  → next step suggestions
      │
      ├── Supabase (DB + Auth + Storage)
      └── Claude API
```

---

## Database Schema

```sql
users
  id, email, created_at, subscription_status, plan_type

cases
  id, user_id, category, description, status,
  opponent_name, amount_disputed, state,
  created_at, resolved_at, outcome

documents
  id, case_id, type (letter/script/complaint),
  content, pdf_url, created_at

escalation_steps
  id, case_id, step_number, action_type,
  completed, completed_at, notes
```

---

## AI Prompt Strategy

Each Claude API call uses a structured system prompt that:
1. Positions Advocate as an "information tool, not legal advice" (liability protection)
2. Loads state-specific consumer protection laws for selected state
3. Returns structured JSON for predictable rendering

**Output schema:**
```json
{
  "rights": ["string"],
  "applicable_laws": ["string"],
  "demand_letter": "string",
  "phone_script": {
    "opening": "string",
    "negotiation": "string",
    "pushback": "string",
    "escalation": "string"
  },
  "next_steps": ["string"]
}
```

---

## Launch Plan (Zero Budget)

| Week | Milestone |
|---|---|
| 1–2 | Case Builder + AI letter generation (MVP core) |
| 3 | Onboarding + RevenueCat paywall |
| 4 | Phone Script + Outcome Tracker |
| 5 | UI polish + real device testing |
| 6 | Google Play submission ($25) |
| 7+ | TikTok content: real cases + real outcomes |

**Distribution (zero cost):**
- TikTok: "I used AI to get my $1,400 deposit back" style content
- Reddit: r/personalfinance, r/legaladvice, r/landlord, r/freelance
- YouTube Shorts: real case walkthroughs

---

## Success Metrics

| Metric | Target (Month 3) |
|---|---|
| Downloads | 5,000+ |
| Paying subscribers | 300+ |
| MRR | $3,000+ |
| Day-7 retention | 30%+ |
| Trial-to-paid conversion | 10%+ |

---

## Legal Disclaimer Strategy

All AI-generated content includes:
> "This letter was prepared using publicly available legal information. It does not constitute legal advice. For complex matters, consult a licensed attorney."

This positions Advocate as an information tool (like a legal search engine), not a law firm — keeping regulatory risk minimal for a solo developer.
