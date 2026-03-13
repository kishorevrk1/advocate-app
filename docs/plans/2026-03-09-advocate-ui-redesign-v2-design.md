# Advocate App — UI Redesign V2 Design Document
**Date:** 2026-03-09
**Status:** Approved
**Direction:** Deep Navy + Gold (Powerful & Authoritative)
**Research basis:** Material Design 3 Expressive, validated fintech/legal UI studies, 8pt grid system

---

## Vision

Transform Advocate into a 10/10 premium legal tool that feels like a top-tier law firm in your pocket. Deep navy backgrounds with desaturated gold accents, Inter Variable typography, strict 8pt spacing grid, and a custom shield logo. Every detail is research-validated — no guessing.

---

## Design System

### Color Tokens

```typescript
// Backgrounds (layered navy depth system)
bgBase:      '#080C14'   // deepest layer — screen base
bgScreen:    '#0B1120'   // main screen background
bgCard:      '#111827'   // card/surface background
bgElevated:  '#1A2436'   // elevated cards, selected states
bgHigh:      '#1E2D45'   // modals, dialogs
bgOverlay:   '#243352'   // pressed/hover overlays

// Gold accents (desaturated — full #FFD700 vibrates on navy)
goldPrimary: '#C9A84C'   // CTAs, active tab, key numbers
goldBright:  '#E4BF6A'   // highlights, icon fills, wordmark
goldSoft:    '#D4AF37'   // borders, dividers
goldMuted:   '#A8893A'   // disabled states, secondary labels
goldSubtle:  '#8B7235'   // gradient starts, watermarks

// Gradients
gradientGold: ['#8B7235', '#C9A84C', '#E4BF6A']  // CTAs, icon, hero numbers
gradientHero: ['#0B1120', '#162040', '#1E2D45']   // header backgrounds
gradientCard: ['#111827', '#1A2436']               // card depth

// Glass surfaces
glassBg:     'rgba(17,24,39,0.75)'
glassBorder: 'rgba(201,168,76,0.15)'               // gold-tinted border
glassBorderWhite: 'rgba(255,255,255,0.08)'          // subtle white border

// Text (opacity tiers)
text:          'rgba(255,255,255,0.87)'   // primary
textSecondary: 'rgba(255,255,255,0.60)'
textMuted:     'rgba(255,255,255,0.38)'
textGold:      '#E4BF6A'

// Status
success:     '#32D74B'
successDim:  'rgba(50,215,75,0.15)'
danger:      '#FF453A'
dangerDim:   'rgba(255,69,58,0.15)'
warning:     '#FF9F0A'
warningDim:  'rgba(255,159,10,0.15)'
```

### Typography (Inter — already in Expo)

```typescript
// Font weights: ONLY 400, 500, 700 (max 3 weights)
display:    { fontSize: 32, fontWeight: '700', letterSpacing: -0.64, lineHeight: 40 }
h1:         { fontSize: 28, fontWeight: '700', letterSpacing: -0.28, lineHeight: 36 }
h2:         { fontSize: 24, fontWeight: '600', letterSpacing: -0.24, lineHeight: 32 }
h3:         { fontSize: 20, fontWeight: '600', letterSpacing: 0,     lineHeight: 28 }
bodyLarge:  { fontSize: 16, fontWeight: '400', letterSpacing: 0,     lineHeight: 24 }
bodyMedium: { fontSize: 14, fontWeight: '400', letterSpacing: 0,     lineHeight: 21 }
label:      { fontSize: 14, fontWeight: '500', letterSpacing: 0.28,  lineHeight: 20 }
labelSmall: { fontSize: 12, fontWeight: '500', letterSpacing: 0.24,  lineHeight: 16 }
caption:    { fontSize: 11, fontWeight: '400', letterSpacing: 0.22,  lineHeight: 16 }
overline:   { fontSize: 11, fontWeight: '700', letterSpacing: 1.10,  lineHeight: 16 }  // ALL CAPS
```

### Spacing (8pt grid — strictly enforced)

```typescript
space4:  4    // micro gaps, icon-to-text
space8:  8    // tight padding, icon margins
space12: 12   // compact card padding
space16: 16   // standard card padding ← most common
space24: 24   // section padding, dialog padding
space32: 32   // screen horizontal margin
space48: 48   // between major sections
space64: 64   // hero top padding
```

### Border Radius (intentional variation = premium feel)

```typescript
radiusXS:   4    // chips, small tags
radiusSM:   8    // small cards, inputs
radiusMD:   12   // standard cards (most used)
radiusLG:   16   // feature cards
radiusXL:   20   // hero cards, bottom sheets
radiusFull: 28   // pill buttons, FAB
```

### Shadows (tonal elevation for dark backgrounds)

```typescript
shadow1: { shadowColor: '#000', shadowOpacity: 0.40, shadowRadius: 3,  elevation: 2 }   // cards
shadow2: { shadowColor: '#000', shadowOpacity: 0.50, shadowRadius: 8,  elevation: 4 }   // elevated
shadow3: { shadowColor: '#000', shadowOpacity: 0.60, shadowRadius: 16, elevation: 8 }   // modals
shadowGold: { shadowColor: '#C9A84C', shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }  // gold glow
```

---

## App Logo / Icon

**Concept: Geometric Shield + A Monogram**

A navy pentagon shield with a stylized golden "A" inside:
- Two diagonal gold strokes meeting at the shield's top apex
- Shield base acts as the "A" crossbar (negative space)
- Corner radius 8dp on shield corners for modern feel
- Gold gradient fill: `#8B7235` (bottom) → `#E4BF6A` (top-left, lit from above)
- App icon: shield on `#0B1120` background

Implemented as an SVG component (`ShieldLogo.tsx`) using `react-native-svg`.

Tab icon: simplified version — just shield outline at 24×24.

---

## Tab Bar

```
Background:     rgba(8,12,20,0.97)
Top border:     1px rgba(201,168,76,0.20)
Height:         68px + safe area inset
Active color:   #C9A84C (gold)
Inactive color: rgba(255,255,255,0.35)

Icons (Ionicons from @expo/vector-icons):
  Home     → ios-home / ios-home-outline
  My Cases → briefcase / briefcase-outline
  Settings → settings / settings-outline

Active indicator: subtle gold pill (32×4dp) above icon
```

---

## Screen Designs

### All Screens — Shared Patterns
- Background: `#0B1120` with `LinearGradient` header fade
- Cards: `rgba(17,24,39,0.75)` with `1px rgba(201,168,76,0.15)` border
- Primary CTA: gold gradient pill button, 56px height, `#0B1120` text
- Animations: `FadeInDown` entry, spring press scale 0.96
- Status bar: dark/transparent

### Onboarding Screen 1
- Deep navy bg with gold radial glow at center
- "⚡ AI-POWERED" badge: gold border + gold text
- "$300–800" in gold gradient text, 64px weight 900
- Stats row: glass card, gold numbers
- CTA: gold gradient pill "Get What You're Owed →"

### Home Dashboard
- Shield logo + "Advocate" in gold top-left
- 3 stat cards: navy glass, "Recovered" card has gold glow border + gold number
- New Case CTA: full-width gold gradient, black text, 56px
- Case cards: navy glass, gold left strip, category color accent

### Case Analysis
- Rights: green check circles on glass card
- Recovery amount: gold gradient text with gold glow
- Action buttons: glass cards with gold gradient icon boxes

### Paywall
- Gold "SAVE 40%" badge on annual plan
- Gold CTA "Start Free Trial →"
- Feature list with gold icon boxes

### Settings
- Glass section cards
- "PRO" badge: gold gradient
- Sign Out: danger glass card

---

## Dependencies

- `@expo/vector-icons` — already installed (Ionicons for tab icons)
- `react-native-svg` — for shield logo SVG
- `expo-linear-gradient` — already installed
- `@react-native-masked-view/masked-view` — already installed

---

## Key UX Rules (from research)
1. **Gold at max 15% screen area** — it's punctuation, not wallpaper
2. **8pt grid strictly** — every spacing value divisible by 4 or 8
3. **3 font weights max** — 400, 500, 700 only
4. **Negative letter-spacing on headings** — `-0.01em` to `-0.02em`
5. **Empty states on every screen** — with illustration + gold CTA
6. **Status bar dark/translucent** — breaks immersion if left light
