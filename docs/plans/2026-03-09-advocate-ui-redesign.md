# Advocate UI Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild all screens with Dark Glass Premium aesthetic — glass morphism cards, gradient buttons, spring animations, and animated numbers using Apple Wallet / Stripe visual language.

**Architecture:** Shared UI component library in `src/components/ui/` consumed by all screens. New color palette in `src/theme/colors.ts`. Reanimated 2 for all animations. expo-linear-gradient for gradients. Each screen rebuilt in-place (same file paths).

**Tech Stack:** React Native, Expo, react-native-reanimated (already installed), expo-linear-gradient, @react-native-masked-view/masked-view, react-native-safe-area-context

---

## Phase 1: Foundation

### Task 1: Install dependencies + update color system

**Files:**
- Modify: `advocate/src/theme/colors.ts`

**Step 1: Install gradient + masked-view packages**

```bash
cd E:/new_apps/advocate
npx expo install expo-linear-gradient @react-native-masked-view/masked-view
```
Expected: installs cleanly

**Step 2: Replace `src/theme/colors.ts`**

```typescript
export const colors = {
  // Backgrounds
  background: '#080816',
  backgroundAlt: '#0D0D1F',

  // Glass surfaces
  surface: 'rgba(255,255,255,0.06)',
  surfaceBright: 'rgba(255,255,255,0.10)',
  surfacePressed: 'rgba(255,255,255,0.14)',

  // Borders
  border: 'rgba(255,255,255,0.10)',
  borderBright: 'rgba(255,255,255,0.20)',

  // Primary (indigo-blue)
  primary: '#4F6EFF',
  primaryLight: '#7B8FFF',
  primaryDark: '#3A55E8',

  // Accent (electric teal)
  accent: '#00E5C0',
  accentDim: 'rgba(0,229,192,0.20)',

  // Status
  success: '#32D74B',
  successDim: 'rgba(50,215,75,0.20)',
  danger: '#FF453A',
  dangerDim: 'rgba(255,69,58,0.20)',
  warning: '#FF9F0A',
  warningDim: 'rgba(255,159,10,0.20)',

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.30)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#4F6EFF', '#7B5EFF'] as string[],
  gradientAccent: ['#00E5C0', '#00B4D8'] as string[],
  gradientDark: ['#0D0D1F', '#080816'] as string[],
  gradientCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as string[],
}
```

**Step 3: Commit**
```bash
git add src/theme/colors.ts
git commit -m "feat: update color system to Dark Glass Premium palette"
```

---

### Task 2: Create shared UI components

**Files:**
- Create: `advocate/src/components/ui/GlassCard.tsx`
- Create: `advocate/src/components/ui/GradientButton.tsx`
- Create: `advocate/src/components/ui/AnimatedNumber.tsx`
- Create: `advocate/src/components/ui/GradientText.tsx`
- Create: `advocate/src/components/ui/index.ts`

**Step 1: Create `src/components/ui/GlassCard.tsx`**

```typescript
import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  glow?: string  // optional glow color e.g. colors.primary
  gradient?: boolean
}

export default function GlassCard({ children, style, glow, gradient }: Props) {
  return (
    <View style={[styles.wrapper, glow ? { shadowColor: glow, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 } : {}, style]}>
      {gradient ? (
        <LinearGradient
          colors={colors.gradientCard}
          style={styles.inner}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={styles.inner}>{children}</View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  inner: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
})
```

**Step 2: Create `src/components/ui/GradientButton.tsx`**

```typescript
import React from 'react'
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { colors } from '../../theme/colors'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  gradient?: string[]
  variant?: 'primary' | 'accent' | 'danger'
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function GradientButton({
  label, onPress, loading, disabled, style,
  gradient, variant = 'primary'
}: Props) {
  const scale = useSharedValue(1)

  const gradientColors = gradient ||
    (variant === 'accent' ? colors.gradientAccent :
     variant === 'danger' ? [colors.danger, '#FF6B63'] :
     colors.gradientPrimary) as [string, string]

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedTouchable
      style={[styles.wrapper, animStyle, style, disabled && styles.disabled]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96) }}
      onPressOut={() => { scale.value = withSpring(1.0) }}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <LinearGradient
        colors={gradientColors as [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.label}>{label}</Text>
        }
      </LinearGradient>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 18, overflow: 'hidden' },
  gradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  label: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
})
```

**Step 3: Create `src/components/ui/AnimatedNumber.tsx`**

```typescript
import React, { useEffect } from 'react'
import { Text, TextStyle } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing
} from 'react-native-reanimated'

const AnimatedText = Animated.createAnimatedComponent(Text)

interface Props {
  value: number
  prefix?: string
  suffix?: string
  style?: TextStyle
  duration?: number
  formatter?: (n: number) => string
}

export default function AnimatedNumber({ value, prefix = '', suffix = '', style, duration = 1200, formatter }: Props) {
  const animValue = useSharedValue(0)

  useEffect(() => {
    animValue.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
  }, [value])

  const animProps = useAnimatedProps(() => ({
    text: `${prefix}${formatter ? formatter(Math.floor(animValue.value)) : Math.floor(animValue.value).toLocaleString()}${suffix}`,
  } as any))

  return <AnimatedText style={style} animatedProps={animProps} />
}
```

**Step 4: Create `src/components/ui/GradientText.tsx`**

```typescript
import React from 'react'
import { Text, TextStyle } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'

interface Props {
  children: string
  style?: TextStyle
  gradient?: string[]
}

export default function GradientText({ children, style, gradient = colors.gradientPrimary }: Props) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  )
}
```

**Step 5: Create `src/components/ui/index.ts`**

```typescript
export { default as GlassCard } from './GlassCard'
export { default as GradientButton } from './GradientButton'
export { default as AnimatedNumber } from './AnimatedNumber'
export { default as GradientText } from './GradientText'
```

**Step 6: Commit**
```bash
git add src/components/
git commit -m "feat: add shared Glass Premium UI component library"
```

---

## Phase 2: Onboarding Screens

### Task 3: Redesign Onboarding Screen 1 (Hook)

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen1.tsx`

**Step 1: Replace with full redesign**

```typescript
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, FadeInDown
} from 'react-native-reanimated'
import { colors } from '../../theme/colors'
import { GradientButton, AnimatedNumber } from '../../components/ui'

const { height } = Dimensions.get('window')

interface Props { onNext: () => void }

export default function OnboardingScreen1({ onNext }: Props) {
  const badgeOpacity = useSharedValue(0)
  const badgeY = useSharedValue(-10)

  useEffect(() => {
    badgeOpacity.value = withDelay(200, withTiming(1, { duration: 600 }))
    badgeY.value = withDelay(200, withSpring(0))
  }, [])

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ translateY: badgeY.value }],
  }))

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1040', '#0D0D1F', '#080816']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Radial glow behind hero text */}
      <View style={styles.glowBehind} />

      <SafeAreaView style={styles.inner}>
        {/* Badge */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <LinearGradient
            colors={['rgba(79,110,255,0.3)', 'rgba(123,94,255,0.3)']}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.badgeText}>⚡ AI-POWERED LEGAL RIGHTS</Text>
          </LinearGradient>
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text style={styles.heroSub}>Americans lose</Text>
          <Text style={styles.heroAmount}>$300–800</Text>
          <Text style={styles.heroSub}>per year to unfair charges.</Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.body}
        >
          Withheld deposits. Unauthorized subscriptions. Denied refunds.{' '}
          <Text style={styles.bodyBold}>You have rights. It's time to use them.</Text>
        </Animated.Text>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.statsRow}>
          {[
            { value: 2300000, prefix: '$', label: 'Recovered', format: (n: number) => `$${(n/1000000).toFixed(1)}M` },
            { value: 94, suffix: '%', label: 'Win rate', format: (n: number) => `${n}%` },
            { value: 60, suffix: 's', label: 'To your letter', format: (n: number) => `${n}s` },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stat.format(stat.value)}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(900).duration(600)} style={styles.cta}>
          <GradientButton label="Get What You're Owed →" onPress={onNext} />
          <Text style={styles.ctaSub}>Free to try · No credit card needed</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },
  glowBehind: {
    position: 'absolute', top: height * 0.15, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(79,110,255,0.12)',
  },
  badge: { alignSelf: 'flex-start', marginBottom: 36, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(79,110,255,0.4)' },
  badgeGradient: { paddingHorizontal: 14, paddingVertical: 7 },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  heroSub: { fontSize: 22, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  heroAmount: {
    fontSize: 64, fontWeight: '900', color: colors.accent,
    letterSpacing: -2, lineHeight: 72,
  },
  body: { fontSize: 16, color: colors.textSecondary, lineHeight: 26, marginTop: 20, marginBottom: 36 },
  bodyBold: { color: colors.text, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: colors.border, marginBottom: 'auto' as any,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 22, fontWeight: '900', color: colors.accent, marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  cta: { paddingBottom: 20 },
  ctaSub: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
})
```

**Step 2: Commit**
```bash
git add src/screens/onboarding/OnboardingScreen1.tsx
git commit -m "feat: redesign onboarding screen 1 with glass premium UI"
```

---

### Task 4: Redesign Onboarding Screens 2 + 3

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen2.tsx`
- Modify: `advocate/src/screens/onboarding/OnboardingScreen3.tsx`

**Step 1: Replace OnboardingScreen2.tsx**

```typescript
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { GradientButton } from '../../components/ui'

const CATEGORIES = [
  { id: 'deposit', emoji: '🏠', title: 'Security Deposit', subtitle: 'Landlord keeping your money', color: '#4F6EFF' },
  { id: 'charges', emoji: '💳', title: 'Unauthorized Charges', subtitle: 'Subscription or billing fraud', color: '#FF453A' },
  { id: 'travel', emoji: '✈️', title: 'Flight / Travel', subtitle: 'Cancelled or delayed flights', color: '#00B4D8' },
  { id: 'invoice', emoji: '💼', title: 'Unpaid Invoice', subtitle: "Client not paying what's owed", color: '#FF9F0A' },
  { id: 'product', emoji: '📦', title: 'Defective Product', subtitle: 'Return denied or product broken', color: '#00E5C0' },
]

interface Props { onNext: (category: string) => void }

function CategoryCard({ cat, selected, onPress }: { cat: typeof CATEGORIES[0], selected: boolean, onPress: () => void }) {
  const scale = useSharedValue(1)
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const handlePress = () => {
    scale.value = withSpring(0.97, {}, () => { scale.value = withSpring(1) })
    onPress()
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.card, selected && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.emojiBox, { backgroundColor: cat.color + '20' }]}>
          <Text style={styles.emoji}>{cat.emoji}</Text>
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, selected && { color: cat.color }]}>{cat.title}</Text>
          <Text style={styles.cardSub}>{cat.subtitle}</Text>
        </View>
        {selected && (
          <View style={[styles.check, { backgroundColor: cat.color }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function OnboardingScreen2({ onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.step}>STEP 1 OF 3</Text>
          <Text style={styles.title}>What's your{'\n'}situation?</Text>
          <Text style={styles.subtitle}>We'll tailor your rights and letter to your exact case.</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat, i) => (
          <Animated.View key={cat.id} entering={FadeInDown.delay(i * 80).duration(400)}>
            <CategoryCard cat={cat} selected={selected === cat.id} onPress={() => setSelected(cat.id)} />
          </Animated.View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.footer}>
        <GradientButton
          label="Continue →"
          onPress={() => selected && onNext(selected)}
          disabled={!selected}
          style={styles.btn}
        />
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 8 },
  step: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title: { fontSize: 36, fontWeight: '900', color: colors.text, lineHeight: 44, marginBottom: 10 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  list: { paddingHorizontal: 24, paddingVertical: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 18, padding: 18,
    marginBottom: 12, borderWidth: 1.5, borderColor: colors.border,
  },
  emojiBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  emoji: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  cardSub: { fontSize: 13, color: colors.textSecondary },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  btn: { width: '100%' },
})
```

**Step 2: Replace OnboardingScreen3.tsx**

```typescript
import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../../theme/colors'
import { GlassCard, GradientButton } from '../../components/ui'

const STEPS = [
  { emoji: '⚖️', title: 'Know Your Rights', desc: 'We identify exactly which laws apply to your situation in your state', gradient: ['#4F6EFF', '#7B5EFF'] as [string,string] },
  { emoji: '📝', title: 'Draft Your Letter', desc: 'A professional demand letter with legal citations in 60 seconds', gradient: ['#00E5C0', '#00B4D8'] as [string,string] },
  { emoji: '📞', title: 'Script Your Call', desc: 'Know exactly what to say — opening, pushback, escalation language', gradient: ['#FF9F0A', '#FF6B35'] as [string,string] },
  { emoji: '🎯', title: 'Track to Victory', desc: 'Step-by-step escalation path until you win', gradient: ['#32D74B', '#00E5C0'] as [string,string] },
]

interface Props { onNext: () => void }

export default function OnboardingScreen3({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.step}>STEP 2 OF 3</Text>
          <Text style={styles.title}>Here's how we{'\n'}fight for you.</Text>
        </Animated.View>

        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 100 + 200).duration(500)}>
              <GlassCard style={styles.stepCard}>
                <View style={styles.stepRow}>
                  <LinearGradient colors={s.gradient} style={styles.iconBox} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.icon}>{s.emoji}</Text>
                  </LinearGradient>
                  <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    <Text style={styles.stepDesc}>{s.desc}</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ️ Advocate provides legal information, not legal advice.
          </Text>
        </View>

        <GradientButton label="See Pricing →" onPress={onNext} />
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  step: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, lineHeight: 42, marginBottom: 24 },
  steps: { flex: 1, gap: 10 },
  stepCard: { marginBottom: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0 },
  icon: { fontSize: 22 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 3 },
  stepDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  disclaimer: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    marginVertical: 16, borderWidth: 1, borderColor: colors.border,
  },
  disclaimerText: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
})
```

**Step 3: Commit**
```bash
git add src/screens/onboarding/
git commit -m "feat: redesign onboarding screens 2-3 with glass cards and animations"
```

---

## Phase 3: Auth + Paywall

### Task 5: Redesign Auth Screen

**Files:**
- Modify: `advocate/src/screens/AuthScreen.tsx`

**Step 1: Replace AuthScreen.tsx**

```typescript
import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TextInput, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { GradientButton } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password')
      return
    }
    setLoading(true)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) Alert.alert('Error', error.message)
    else if (isSignUp) Alert.alert('Check your email', 'We sent you a confirmation link.')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1040', '#0D0D1F', '#080816']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inner}>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.logoBlock}>
              <Text style={styles.logoEmoji}>⚖️</Text>
              <Text style={styles.appName}>Advocate</Text>
              <Text style={styles.tagline}>Know your rights. Fight back. Win.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
              <TextInput
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              <TextInput
                style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <GradientButton
                label={isSignUp ? 'Create Account' : 'Sign In'}
                onPress={handleAuth}
                loading={loading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                </Text>
              </TouchableOpacity>
              <Text style={styles.legal}>
                Advocate provides legal information, not legal advice.
              </Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 32 },
  logoBlock: { alignItems: 'center' },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  appName: { fontSize: 36, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  form: { gap: 14 },
  input: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    fontSize: 16, color: colors.text, borderWidth: 1.5, borderColor: colors.border,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surfaceBright },
  toggle: { alignItems: 'center', marginBottom: 16 },
  toggleText: { color: colors.textSecondary, fontSize: 14 },
  toggleLink: { color: colors.primary, fontWeight: '700' },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
})
```

**Step 2: Commit**
```bash
git add src/screens/AuthScreen.tsx
git commit -m "feat: redesign auth screen with gradient background and glass inputs"
```

---

## Phase 4: Core App Screens

### Task 6: Redesign Home Dashboard

**Files:**
- Modify: `advocate/src/screens/HomeScreen.tsx`
- Modify: `advocate/src/navigation/AppNavigator.tsx`

**Step 1: Replace HomeScreen.tsx**

```typescript
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { GlassCard, GradientButton } from '../components/ui'
import { getUserCases } from '../api/cases'
import { useAuthStore } from '../store/authStore'

const CATEGORY_META: Record<string, { label: string, color: string }> = {
  deposit:  { label: '🏠 Security Deposit',     color: '#4F6EFF' },
  charges:  { label: '💳 Unauthorized Charges', color: '#FF453A' },
  travel:   { label: '✈️ Flight / Travel',       color: '#00B4D8' },
  invoice:  { label: '💼 Unpaid Invoice',        color: '#FF9F0A' },
  product:  { label: '📦 Defective Product',     color: '#00E5C0' },
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore()
  const [cases, setCases] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadCases = async () => {
    try { setCases(await getUserCases() || []) } catch {}
  }

  useFocusEffect(useCallback(() => { loadCases() }, []))

  const onRefresh = async () => { setRefreshing(true); await loadCases(); setRefreshing(false) }

  const activeCases = cases.filter(c => c.status === 'active')
  const wonCases = cases.filter(c => c.outcome === 'won')
  const totalRecovered = cases
    .filter(c => c.outcome === 'won' && c.amount_disputed)
    .reduce((s, c) => s + c.amount_disputed, 0)

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1040', colors.background]} style={styles.headerGradient} start={{x:0.5,y:0}} end={{x:0.5,y:1}} />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View>
              <Text style={styles.appName}>⚖️ Advocate</Text>
              <Text style={styles.subtitle}>Know your rights. Fight back. Win.</Text>
            </View>
          </Animated.View>

          {/* Stat Cards */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNum}>{activeCases.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </GlassCard>
            <GlassCard style={[styles.statCard, styles.statCardAccent]} glow={colors.accent}>
              <Text style={[styles.statNum, styles.statNumAccent]}>
                ${totalRecovered > 0 ? (totalRecovered/1000).toFixed(1)+'K' : '0'}
              </Text>
              <Text style={styles.statLabel}>Recovered</Text>
            </GlassCard>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statNum}>{wonCases.length}</Text>
              <Text style={styles.statLabel}>Won</Text>
            </GlassCard>
          </Animated.View>

          {/* New Case CTA */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.ctaWrapper}>
            <TouchableOpacity onPress={() => navigation.navigate('NewCase')} activeOpacity={0.9} style={styles.ctaTouchable}>
              <LinearGradient
                colors={colors.gradientPrimary as [string,string]}
                style={styles.ctaGradient}
                start={{x:0,y:0}} end={{x:1,y:0}}
              >
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaEmoji}>⚡</Text>
                  <View>
                    <Text style={styles.ctaTitle}>Start New Case</Text>
                    <Text style={styles.ctaSub}>Demand letter in 60 seconds</Text>
                  </View>
                  <Text style={styles.ctaArrow}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Active Cases */}
          {activeCases.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text style={styles.sectionTitle}>ACTIVE CASES</Text>
              {activeCases.slice(0, 3).map((c, i) => {
                const meta = CATEGORY_META[c.category] || { label: c.category, color: colors.primary }
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => navigation.navigate('OutcomeTracker', { caseId: c.id, analysis: null })}
                    activeOpacity={0.85}
                  >
                    <GlassCard style={styles.caseCard}>
                      <View style={[styles.caseStrip, { backgroundColor: meta.color }]} />
                      <View style={styles.caseBody}>
                        <Text style={[styles.caseCat, { color: meta.color }]}>{meta.label}</Text>
                        {c.amount_disputed && (
                          <Text style={styles.caseAmount}>${c.amount_disputed.toLocaleString()}</Text>
                        )}
                        <Text style={styles.caseDesc} numberOfLines={2}>{c.description}</Text>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                )
              })}
            </Animated.View>
          )}

          {cases.length === 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.empty}>
              <Text style={styles.emptyEmoji}>⚖️</Text>
              <Text style={styles.emptyTitle}>No cases yet</Text>
              <Text style={styles.emptySub}>Start your first case above.{'\n'}Most disputes resolve within 2 weeks.</Text>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 8, paddingBottom: 24 },
  appName: { fontSize: 24, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, padding: 16, alignItems: 'center' },
  statCardAccent: { borderColor: colors.accent },
  statNum: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 3 },
  statNumAccent: { color: colors.accent },
  statLabel: { fontSize: 11, color: colors.textMuted },
  ctaWrapper: { marginBottom: 32 },
  ctaTouchable: { borderRadius: 20, overflow: 'hidden' },
  ctaGradient: { borderRadius: 20 },
  ctaContent: { flexDirection: 'row', alignItems: 'center', padding: 22 },
  ctaEmoji: { fontSize: 30, marginRight: 16 },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  ctaArrow: { fontSize: 28, color: '#FFF', marginLeft: 'auto' as any },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  caseCard: { marginBottom: 12, flexDirection: 'row', overflow: 'hidden', padding: 0 },
  caseStrip: { width: 4, borderRadius: 4 },
  caseBody: { flex: 1, padding: 16 },
  caseCat: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  caseAmount: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 4 },
  caseDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
```

**Step 2: Update AppNavigator tab bar styling**

In `src/navigation/AppNavigator.tsx`, update `screenOptions` inside `HomeTabs`:
```typescript
screenOptions={{
  headerShown: false,
  tabBarStyle: {
    backgroundColor: 'rgba(8,8,22,0.95)',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: 'rgba(255,255,255,0.30)',
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
}}
```

**Step 3: Commit**
```bash
git add src/screens/HomeScreen.tsx src/navigation/AppNavigator.tsx
git commit -m "feat: redesign home dashboard with gradient hero and glass stat cards"
```

---

### Task 7: Redesign Case Analysis + Action Screens

**Files:**
- Modify: `advocate/src/screens/CaseAnalysisScreen.tsx`
- Modify: `advocate/src/screens/NewCaseScreen.tsx`

**Step 1: Replace CaseAnalysisScreen.tsx**

```typescript
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { GlassCard } from '../components/ui'

export default function CaseAnalysisScreen({ route, navigation }: any) {
  const { analysis, caseId } = route.params

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1040', colors.background]} style={styles.topGradient} start={{x:0.5,y:0}} end={{x:0.5,y:1}} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.back}>
            <Text style={styles.backText}>← Dashboard</Text>
          </TouchableOpacity>

          <Animated.Text entering={FadeInDown.duration(400)} style={styles.header}>
            ⚖️ Case Analysis
          </Animated.Text>

          {/* Rights */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={styles.sectionLabel}>YOUR RIGHTS</Text>
            <GlassCard style={styles.section}>
              {analysis.rights.map((right: string, i: number) => (
                <Animated.View key={i} entering={FadeInLeft.delay(i * 80).duration(400)} style={styles.rightRow}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                  <Text style={styles.rightText}>{right}</Text>
                </Animated.View>
              ))}
            </GlassCard>
          </Animated.View>

          {/* Laws */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.sectionLabel}>APPLICABLE LAWS</Text>
            <View style={styles.lawsWrap}>
              {analysis.applicable_laws.map((law: string, i: number) => (
                <GlassCard key={i} style={styles.lawChip}>
                  <Text style={styles.lawText}>⚖️ {law}</Text>
                </GlassCard>
              ))}
            </View>
          </Animated.View>

          {/* Recovery */}
          {analysis.estimated_recovery && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text style={styles.sectionLabel}>ESTIMATED RECOVERY</Text>
              <GlassCard style={styles.recoveryCard} glow={colors.accent}>
                <LinearGradient colors={[colors.accentDim, 'transparent']} style={styles.recoveryGradient}>
                  <Text style={styles.recoveryAmount}>{analysis.estimated_recovery}</Text>
                  <Text style={styles.recoveryLabel}>potential recovery</Text>
                </LinearGradient>
              </GlassCard>
            </Animated.View>
          )}

          {/* Actions */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={styles.sectionLabel}>TAKE ACTION</Text>
            {[
              { emoji: '📝', title: 'View Demand Letter', sub: 'Professional letter ready to send', gradient: colors.gradientPrimary as [string,string], screen: 'DemandLetter' },
              { emoji: '📞', title: 'Phone Script', sub: 'Know exactly what to say', gradient: ['#00E5C0', '#00B4D8'] as [string,string], screen: 'PhoneScript' },
              { emoji: '🎯', title: 'Track Your Case', sub: 'Step-by-step escalation path', gradient: ['#32D74B', '#00E5C0'] as [string,string], screen: 'OutcomeTracker' },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => navigation.navigate(action.screen, { analysis, caseId })}
                activeOpacity={0.85}
              >
                <GlassCard style={styles.actionCard}>
                  <LinearGradient colors={action.gradient} style={styles.actionIcon} start={{x:0,y:0}} end={{x:1,y:1}}>
                    <Text style={styles.actionEmoji}>{action.emoji}</Text>
                  </LinearGradient>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSub}>{action.sub}</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </Animated.View>

          <Text style={styles.disclaimer}>
            ℹ️ For informational purposes only. Not legal advice.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  back: { paddingVertical: 12 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  header: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 28 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 10 },
  section: { padding: 20, marginBottom: 24 },
  rightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.successDim,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2, flexShrink: 0,
  },
  checkIcon: { color: colors.success, fontSize: 12, fontWeight: '800' },
  rightText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  lawsWrap: { gap: 8, marginBottom: 24 },
  lawChip: { padding: 14 },
  lawText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  recoveryCard: { marginBottom: 24, overflow: 'hidden' },
  recoveryGradient: { padding: 24, borderRadius: 20 },
  recoveryAmount: { fontSize: 32, fontWeight: '900', color: colors.accent, marginBottom: 4 },
  recoveryLabel: { fontSize: 13, color: colors.textSecondary },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, marginBottom: 12 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  actionEmoji: { fontSize: 22 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  actionSub: { fontSize: 13, color: colors.textSecondary },
  actionArrow: { fontSize: 24, color: colors.textSecondary },
  disclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 8 },
})
```

**Step 2: Update NewCaseScreen — just update styles to match new design system (logic unchanged)**

In `src/screens/NewCaseScreen.tsx`, update the stylesheet colors:
- `backgroundColor: colors.background` on container
- `backgroundColor: colors.surface` → keep same (already matches)
- `borderColor: colors.border` → keep same
- Add gradient to the analyzeButton using `LinearGradient` wrapped in `TouchableOpacity`

Replace the `analyzeButton` and `analyzeButtonText` styles and JSX:
```typescript
// Replace the TouchableOpacity analyze button with:
<TouchableOpacity
  style={[styles.analyzeWrapper, !description.trim() && styles.buttonDisabled]}
  onPress={handleAnalyze}
  disabled={!description.trim()}
>
  <LinearGradient
    colors={colors.gradientPrimary as [string, string]}
    style={styles.analyzeButton}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <Text style={styles.analyzeButtonText}>⚖️ Analyze My Case →</Text>
  </LinearGradient>
</TouchableOpacity>
```
Add import: `import { LinearGradient } from 'expo-linear-gradient'`
Add styles:
```typescript
analyzeWrapper: { borderRadius: 18, overflow: 'hidden', marginTop: 20 },
analyzeButton: { paddingVertical: 18, alignItems: 'center' },
```

**Step 3: Commit**
```bash
git add src/screens/CaseAnalysisScreen.tsx src/screens/NewCaseScreen.tsx
git commit -m "feat: redesign case analysis with gradient accents and animated rights"
```

---

### Task 8: Redesign Demand Letter + Phone Script + Outcome Tracker

**Files:**
- Modify: `advocate/src/screens/DemandLetterScreen.tsx`
- Modify: `advocate/src/screens/PhoneScriptScreen.tsx`
- Modify: `advocate/src/screens/OutcomeTrackerScreen.tsx`

**Step 1: Update DemandLetterScreen toolbar + Export button**

In `DemandLetterScreen.tsx`:
- Wrap the toolbar `View` in a `LinearGradient` from `['rgba(8,8,22,0.98)', 'rgba(8,8,22,0.90)']`
- Replace `exportButton` style gradient: wrap TouchableOpacity in `LinearGradient` with `colors.gradientPrimary`
- Add `borderTopColor: 'rgba(255,255,255,0.08)'` to toolbar
- The tips `View` at bottom: add `backgroundColor: colors.surface`

**Step 2: Update PhoneScriptScreen stage tabs**

In `PhoneScriptScreen.tsx`, replace active tab background with `LinearGradient`:
```typescript
// For active stage tab, wrap inner content in LinearGradient
{activeStage === stage.key ? (
  <LinearGradient colors={[stage.color + 'AA', stage.color + '44']} style={styles.stageTabActive} start={{x:0,y:0}} end={{x:1,y:0}}>
    <Text style={styles.stageEmoji}>{stage.emoji}</Text>
    <Text style={[styles.stageLabel, { color: stage.color }]}>{stage.label}</Text>
  </LinearGradient>
) : (
  <>
    <Text style={styles.stageEmoji}>{stage.emoji}</Text>
    <Text style={styles.stageLabel}>{stage.label}</Text>
  </>
)}
```

**Step 3: Update OutcomeTrackerScreen**

Replace "I Won!" button with gradient:
```typescript
<TouchableOpacity onPress={handleWon} activeOpacity={0.9} style={styles.wonWrapper}>
  <LinearGradient colors={colors.gradientAccent as [string,string]} style={styles.wonButton} start={{x:0,y:0}} end={{x:1,y:0}}>
    <Text style={styles.wonButtonText}>🎉 I Won My Case!</Text>
  </LinearGradient>
</TouchableOpacity>
```
Add `wonWrapper: { borderRadius: 18, overflow: 'hidden', marginTop: 8, marginBottom: 16 }`

Update active step action button same way with `gradientPrimary`.

**Step 4: Commit**
```bash
git add src/screens/DemandLetterScreen.tsx src/screens/PhoneScriptScreen.tsx src/screens/OutcomeTrackerScreen.tsx
git commit -m "feat: apply glass premium styling to letter, script, and tracker screens"
```

---

## Phase 5: Supporting Screens

### Task 9: Redesign My Cases + Settings

**Files:**
- Modify: `advocate/src/screens/MyCasesScreen.tsx`
- Modify: `advocate/src/screens/SettingsScreen.tsx`

**Step 1: Update MyCasesScreen filter pills + cards**

In `MyCasesScreen.tsx`:
- Active filter pill: wrap in `LinearGradient` with `gradientPrimary`
- Case cards: add colored left strip (4px wide `View`) per category color
- Recovered banner: use `GlassCard` with `glow={colors.accent}`

Import `LinearGradient from 'expo-linear-gradient'` and `GlassCard from '../components/ui'`

**Step 2: Update SettingsScreen sections**

In `SettingsScreen.tsx`:
- Wrap all section `View`s with `GlassCard`
- Pro plan badge: wrap text in `LinearGradient` with `gradientPrimary`
- Sign out button: `backgroundColor: colors.dangerDim`, `borderColor: colors.danger`

**Step 3: Commit**
```bash
git add src/screens/MyCasesScreen.tsx src/screens/SettingsScreen.tsx
git commit -m "feat: apply glass premium styling to my cases and settings screens"
```

---

## Phase 6: Paywall + Polish

### Task 10: Redesign Paywall Screen

**Files:**
- Modify: `advocate/src/screens/PaywallScreen.tsx`

**Step 1: Replace PaywallScreen.tsx**

```typescript
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PurchasesPackage } from 'react-native-purchases'
import { colors } from '../theme/colors'
import { GlassCard, GradientButton } from '../components/ui'
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases'

const FEATURES = [
  { icon: '📋', text: 'Unlimited cases' },
  { icon: '📄', text: 'Full PDF demand letters' },
  { icon: '📞', text: 'Phone call scripts with pushback' },
  { icon: '🎯', text: 'Step-by-step escalation tracker' },
  { icon: '⚖️', text: 'State-specific legal rights lookup' },
  { icon: '⚡', text: 'AI case analysis in 60 seconds' },
]

interface Props { onSuccess: () => void; onSkip?: () => void }

export default function PaywallScreen({ onSuccess, onSkip }: Props) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    getOfferings().then(offering => {
      if (offering?.availablePackages?.length) {
        setPackages(offering.availablePackages)
        setSelectedPkg(offering.availablePackages.find(p => p.packageType === 'ANNUAL') || offering.availablePackages[0])
      }
      setLoading(false)
    })
  }, [])

  const handlePurchase = async () => {
    if (!selectedPkg) return
    setPurchasing(true)
    try {
      if (await purchasePackage(selectedPkg)) onSuccess()
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Purchase failed', e.message || 'Please try again')
    }
    setPurchasing(false)
  }

  const handleRestore = async () => {
    const restored = await restorePurchases()
    if (restored) onSuccess()
    else Alert.alert('No purchases found', 'No active subscription found for this account.')
  }

  if (loading) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1040', '#0D0D1F', colors.background]} style={StyleSheet.absoluteFill} start={{x:0.5,y:0}} end={{x:0.5,y:1}} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.step}>STEP 3 OF 3</Text>
            <Text style={styles.title}>Start Fighting Back</Text>
            <Text style={styles.subtitle}>7-day free trial · Cancel anytime</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </Animated.View>

          {packages.length > 0 ? (
            <>
              <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.packages}>
                {packages.map(pkg => {
                  const isAnnual = pkg.packageType === 'ANNUAL'
                  const isSelected = selectedPkg?.identifier === pkg.identifier
                  return (
                    <TouchableOpacity key={pkg.identifier} onPress={() => setSelectedPkg(pkg)} activeOpacity={0.85} style={styles.pkgTouchable}>
                      <GlassCard style={[styles.pkgCard, isSelected && { borderColor: colors.primary }]} glow={isSelected ? colors.primary : undefined}>
                        {isAnnual && (
                          <LinearGradient colors={colors.gradientAccent as [string,string]} style={styles.bestBadge} start={{x:0,y:0}} end={{x:1,y:0}}>
                            <Text style={styles.bestText}>SAVE 40%</Text>
                          </LinearGradient>
                        )}
                        <Text style={[styles.pkgTitle, isSelected && { color: colors.primary }]}>
                          {isAnnual ? 'Annual' : 'Monthly'}
                        </Text>
                        <Text style={styles.pkgPrice}>
                          {pkg.product.priceString}{isAnnual ? '/yr' : '/mo'}
                        </Text>
                        {isAnnual && <Text style={styles.pkgNote}>= $5.83/month</Text>}
                      </GlassCard>
                    </TouchableOpacity>
                  )
                })}
              </Animated.View>

              <GradientButton label={purchasing ? '' : 'Start Free Trial →'} onPress={handlePurchase} loading={purchasing} style={{ marginBottom: 14 }} />
            </>
          ) : (
            <>
              <GlassCard style={styles.devNote}>
                <Text style={styles.devNoteText}>⚙️ RevenueCat not configured. Add EXPO_PUBLIC_REVENUECAT_KEY to .env</Text>
              </GlassCard>
              {onSkip && (
                <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip for now (Development)</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity onPress={handleRestore} style={styles.restore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Subscription auto-renews. Cancel anytime in Google Play settings.{'\n'}
            This is an informational tool, not legal advice.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  step: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.accent, fontWeight: '600', marginBottom: 28 },
  features: { marginBottom: 28, gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  featureEmoji: { fontSize: 18 },
  featureText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  packages: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pkgTouchable: { flex: 1 },
  pkgCard: { padding: 18, alignItems: 'center' },
  bestBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  bestText: { fontSize: 9, fontWeight: '800', color: colors.background },
  pkgTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  pkgPrice: { fontSize: 18, fontWeight: '900', color: colors.text },
  pkgNote: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  devNote: { padding: 16, marginBottom: 16 },
  devNoteText: { color: colors.warning, fontSize: 13, lineHeight: 20 },
  skipBtn: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  skipText: { color: colors.textSecondary, fontSize: 15 },
  restore: { alignItems: 'center', marginBottom: 20 },
  restoreText: { color: colors.textSecondary, fontSize: 14 },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
})
```

**Step 2: Reload and verify**
```bash
# Press r in Expo terminal to reload
```
Expected: Premium paywall with gradient background, glass package cards

**Step 3: Commit**
```bash
git add src/screens/PaywallScreen.tsx
git commit -m "feat: redesign paywall with glass cards, gradient CTA, and feature icons"
```

---

### Task 11: Final polish — safe area + reanimated config

**Files:**
- Modify: `advocate/app.json`
- Modify: `advocate/babel.config.js`

**Step 1: Ensure reanimated babel plugin is configured**

Check `babel.config.js` — it should include `react-native-reanimated/plugin` as last plugin:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

**Step 2: Replace SafeAreaView imports everywhere**

In all screens, replace:
```typescript
import { ..., SafeAreaView } from 'react-native'
```
with:
```typescript
import { SafeAreaView } from 'react-native-safe-area-context'
```

Affected files: HomeScreen, CaseAnalysisScreen, MyCasesScreen, SettingsScreen, NewCaseScreen, OutcomeTrackerScreen, PhoneScriptScreen, DemandLetterScreen

**Step 3: Clear cache and reload**
```bash
npx expo start --clear
```

**Step 4: Commit**
```bash
git add .
git commit -m "feat: complete Dark Glass Premium UI redesign"
```
