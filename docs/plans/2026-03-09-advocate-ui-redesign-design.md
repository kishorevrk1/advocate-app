# Advocate App — UI Redesign Design Document
**Date:** 2026-03-09
**Status:** Approved
**Direction:** Dark Glass Premium (Apple Wallet / Stripe aesthetic)

---

## Vision

Transform Advocate from a functional but flat dark app into a premium, trust-inspiring legal tech product that feels worth $9.99/month on first open. Glass morphism cards, gradient accents, spring animations, and animated stats combine to make users feel empowered and confident.

---

## Design System

### Colors
```typescript
background: '#080816'          // Deep indigo-black
backgroundAlt: '#0D0D1F'       // Slightly lighter for contrast
surface: 'rgba(255,255,255,0.06)'   // Glass base
surfaceBright: 'rgba(255,255,255,0.10)'
border: 'rgba(255,255,255,0.12)'    // Subtle glass border
borderBright: 'rgba(255,255,255,0.20)'

primary: '#4F6EFF'             // Blue-indigo
primaryLight: '#7B8FFF'
primaryGradient: ['#4F6EFF', '#7B5EFF']  // Indigo → Purple

accent: '#00E5C0'              // Electric teal
accentGlow: 'rgba(0,229,192,0.25)'

danger: '#FF453A'
warning: '#FF9F0A'
success: '#32D74B'
successGlow: 'rgba(50,215,75,0.25)'

text: '#FFFFFF'
textSecondary: 'rgba(255,255,255,0.60)'
textMuted: 'rgba(255,255,255,0.35)'
```

### Glass Card Pattern
- `backgroundColor: rgba(255,255,255,0.06)`
- `borderWidth: 1, borderColor: rgba(255,255,255,0.12)`
- `borderRadius: 20`
- Shadow: `shadowColor: '#4F6EFF', shadowOpacity: 0.15, shadowRadius: 20`
- Gradient border highlight: thin top-edge highlight `rgba(255,255,255,0.18)`

### Typography
- Hero numbers: `fontSize: 48+, fontWeight: '900'`, gradient text via MaskedView
- Section headers: `fontSize: 11, fontWeight: '700', letterSpacing: 2`, ALL CAPS
- Body: `fontSize: 15-16, lineHeight: 24`
- Labels: `fontSize: 12, fontWeight: '600', letterSpacing: 0.5`

### Animations (react-native-reanimated)
- **Button press**: `withSpring(0.96)` scale on `pressIn`, back to `1.0` on `pressOut`
- **Screen entry**: `FadeInDown` from 20px offset, 400ms
- **Number count-up**: interpolated from 0 to target over 1200ms with `Easing.out(Easing.cubic)`
- **Shimmer sweep**: horizontal gradient sweep on CTA buttons
- **Checkmark appear**: sequential delay per item, spring scale from 0→1

---

## Screen Designs

### Onboarding Screen 1 — Hook
- Full-height background: radial gradient from indigo center fading to near-black
- Floating animated badge: glass pill, subtle border glow, "⚡ AI-POWERED" text
- Hero dollar amount "$300–800" in gradient text (primary→accent), size 52, weight 900
- Subtext in `textSecondary`
- Stats row: glass card with 3 columns, numbers count up on mount
- CTA: full-width gradient button (primary→primaryLight) with shimmer sweep, spring press

### Onboarding Screen 2 — Category Picker
- Each category card: glass base + 3px left-border accent in category color
- Category colors: deposit=indigo, charges=red, travel=blue, invoice=amber, product=teal
- Selected: border glows with category color, `backgroundColor` shifts to color+15%
- Spring scale animation (1.0→1.02) on selection
- Continue button: locked state is muted, unlocks with gradient when selection made

### Onboarding Screen 3 — Promise
- Steps list: each step has a glass icon box with gradient background
- Icon box: 52×52, borderRadius 16, gradient fill, white emoji
- Timeline connector: thin vertical line between steps

### Paywall Screen
- Annual plan card: gradient border (primary→accent), "BEST VALUE" badge in accent
- Feature checkmarks: accent color with glow dot
- Price: large white number, monthly equivalent in textSecondary
- CTA: full-width gradient with "Start 7-Day Free Trial →", shimmer pulse animation
- Legal text: textMuted, centered

### Auth Screen
- Logo: "⚖️ Advocate" spring-animates in from top on mount
- Inputs: glass background, `rgba(255,255,255,0.08)`, white text, border highlights on focus
- Submit button: gradient, spring press
- Toggle link: accent color

### Home Dashboard
- Header: "⚖️ Advocate" + greeting in textSecondary
- 3 stat cards: glass, number in gradient text, label in textMuted
  - "Recovered" card: accent border glow, accent gradient number
- New Case CTA: full-width gradient hero button, 56px height, arrow animates right on hover
- Case cards: glass card, colored left strip per category, amount in white bold

### Case Analysis Screen
- Header animated in with FadeInDown
- Rights: each item fades in sequentially with 80ms delay, green checkmark with successGlow
- Law citations: glass pill chips, primary+15% background
- Recovery amount: counts up from 0 on mount, teal gradient text, glow behind number
- Action buttons: glass cards with gradient icon backgrounds (52×52), spring press

### Demand Letter Screen
- Toolbar: glass blur background
- Letter paper: white card, realistic multi-layer shadow, floats on dark background
- Export PDF button: gradient, shimmer on idle
- Tips: glass card with amber left-border accent

### Phone Script Screen
- Stage tabs: pill style, active has gradient background + white text
- Script card: glass, thick gradient left border matching stage color
- Recording tip: pulsing red dot (Animated.loop scale)
- Escalation note: danger+15% glass card

### Outcome Tracker Screen
- Timeline: vertical line connecting steps, fills with success color as steps complete
- Step cards: glass, number badge
- Active step: primary glow border, gradient action button
- Completed: success glow border, animated checkmark
- "I Won!" button: full-width accent gradient, large, celebration feel

### My Cases Screen
- Filter pills: glass base, gradient active state
- Case cards: glass, category emoji large, colored status badge
- Recovered banner: accent glass card with trophy emoji

### Settings Screen
- Section cards: glass
- Plan badge: gradient background for Pro, pulsing glow
- Sign Out: danger glass card

---

## Dependencies to Add
- `react-native-reanimated` — already installed, needs config
- `@shopify/react-native-skia` — optional, for advanced gradient effects
- `expo-linear-gradient` — for gradient backgrounds and buttons
- `@react-native-masked-view/masked-view` — for gradient text
- `react-native-blur` — optional for true glass blur

## Implementation Approach
- Update `src/theme/colors.ts` with new palette
- Create `src/components/ui/` folder: `GlassCard`, `GradientButton`, `AnimatedNumber`, `GradientText`
- Rebuild each screen using shared components
- Add Reanimated animations per screen

---
