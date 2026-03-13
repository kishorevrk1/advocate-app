# Advocate UI V2 — Deep Navy + Gold Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current dark indigo UI with a research-validated Deep Navy + Gold design system that scores 10/10 — new color tokens, shield logo, Ionicons tab bar, refined typography, and consistent 8pt grid across all screens.

**Architecture:** Update the shared design tokens in `src/theme/colors.ts` first, then rebuild shared UI components (GlassCard, GradientButton), then update all screens. New ShieldLogo SVG component replaces the ⚖️ emoji. Tab bar gets real icons via Ionicons (already in Expo).

**Tech Stack:** React Native, Expo, expo-linear-gradient, react-native-svg (new), @expo/vector-icons (Ionicons — already installed), react-native-reanimated

---

## Phase 1: Foundation

### Task 1: Install react-native-svg + update color system

**Files:**
- Modify: `advocate/src/theme/colors.ts`

**Step 1: Install react-native-svg**
```bash
cd E:/new_apps/advocate
npx expo install react-native-svg
```
Expected: installs cleanly

**Step 2: Replace `src/theme/colors.ts` entirely**

```typescript
export const colors = {
  // ── Backgrounds (layered navy depth) ──────────────────────────
  bgBase:      '#080C14',   // deepest — screen base
  bgScreen:    '#0B1120',   // main background
  bgCard:      '#111827',   // card/surface
  bgElevated:  '#1A2436',   // elevated cards, selected
  bgHigh:      '#1E2D45',   // modals, dialogs
  bgOverlay:   '#243352',   // pressed/hover

  // Legacy aliases (keeps old screens working during migration)
  background:     '#0B1120',
  backgroundAlt:  '#111827',
  surface:        'rgba(17,24,39,0.75)',
  surfaceBright:  '#1A2436',
  surfacePressed: '#1E2D45',

  // ── Gold accents (desaturated — #FFD700 vibrates on navy) ─────
  goldPrimary: '#C9A84C',   // CTAs, active tab, key numbers
  goldBright:  '#E4BF6A',   // highlights, icon fills
  goldSoft:    '#D4AF37',   // borders, dividers
  goldMuted:   '#A8893A',   // disabled, secondary labels
  goldSubtle:  '#8B7235',   // gradient starts

  // Legacy aliases
  primary:      '#C9A84C',
  primaryLight: '#E4BF6A',
  primaryDark:  '#A8893A',
  accent:       '#C9A84C',
  accentDim:    'rgba(201,168,76,0.15)',

  // ── Borders ───────────────────────────────────────────────────
  border:       'rgba(201,168,76,0.15)',   // gold-tinted glass border
  borderBright: 'rgba(201,168,76,0.30)',
  borderWhite:  'rgba(255,255,255,0.08)',

  // ── Status ────────────────────────────────────────────────────
  success:    '#32D74B',
  successDim: 'rgba(50,215,75,0.15)',
  danger:     '#FF453A',
  dangerDim:  'rgba(255,69,58,0.15)',
  warning:    '#FF9F0A',
  warningDim: 'rgba(255,159,10,0.15)',

  // ── Text (opacity tiers) ──────────────────────────────────────
  text:          'rgba(255,255,255,0.87)',
  textSecondary: 'rgba(255,255,255,0.60)',
  textMuted:     'rgba(255,255,255,0.38)',
  textGold:      '#E4BF6A',

  // ── Gradients ─────────────────────────────────────────────────
  gradientGold:    ['#8B7235', '#C9A84C', '#E4BF6A'] as string[],
  gradientHero:    ['#0B1120', '#162040', '#1E2D45'] as string[],
  gradientCard:    ['#111827', '#1A2436'] as string[],
  gradientPrimary: ['#8B7235', '#C9A84C'] as string[],   // legacy alias
  gradientAccent:  ['#C9A84C', '#E4BF6A'] as string[],   // legacy alias
  gradientDark:    ['#0B1120', '#080C14'] as string[],

  // ── Shadows ───────────────────────────────────────────────────
  shadowGold: 'rgba(201,168,76,0.25)',
}

// ── Typography scale ──────────────────────────────────────────────
export const typography = {
  display:    { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.64, lineHeight: 40 },
  h1:         { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.28, lineHeight: 36 },
  h2:         { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.24, lineHeight: 32 },
  h3:         { fontSize: 20, fontWeight: '600' as const, letterSpacing:  0,    lineHeight: 28 },
  bodyLarge:  { fontSize: 16, fontWeight: '400' as const, letterSpacing:  0,    lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, letterSpacing:  0,    lineHeight: 21 },
  label:      { fontSize: 14, fontWeight: '500' as const, letterSpacing:  0.28, lineHeight: 20 },
  labelSmall: { fontSize: 12, fontWeight: '500' as const, letterSpacing:  0.24, lineHeight: 16 },
  caption:    { fontSize: 11, fontWeight: '400' as const, letterSpacing:  0.22, lineHeight: 16 },
  overline:   { fontSize: 11, fontWeight: '700' as const, letterSpacing:  1.10, lineHeight: 16 },
}

// ── Spacing (8pt grid) ────────────────────────────────────────────
export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
}

// ── Border radius ─────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 28,
}
```

**Step 3: Verify TypeScript**
```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors (legacy aliases keep old screens compiling)

---

### Task 2: Create ShieldLogo component + update shared UI

**Files:**
- Create: `advocate/src/components/ui/ShieldLogo.tsx`
- Modify: `advocate/src/components/ui/GlassCard.tsx`
- Modify: `advocate/src/components/ui/GradientButton.tsx`
- Modify: `advocate/src/components/ui/index.ts`

**Step 1: Create `src/components/ui/ShieldLogo.tsx`**

```typescript
import React from 'react'
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'

interface Props {
  size?: number
  variant?: 'full' | 'icon'  // full = with wordmark space, icon = shield only
}

export default function ShieldLogo({ size = 40, variant = 'icon' }: Props) {
  const w = size
  const h = size * 1.2

  return (
    <Svg width={w} height={h} viewBox="0 0 100 120">
      <Defs>
        <SvgGradient id="goldGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#E4BF6A" />
          <Stop offset="0.5" stopColor="#C9A84C" />
          <Stop offset="1" stopColor="#8B7235" />
        </SvgGradient>
      </Defs>

      {/* Shield outline */}
      <Path
        d="M50 4 L96 20 L96 58 C96 82 74 102 50 116 C26 102 4 82 4 58 L4 20 Z"
        fill="url(#goldGrad)"
      />

      {/* Shield inner (navy cutout for depth) */}
      <Path
        d="M50 12 L88 26 L88 58 C88 78 68 96 50 108 C32 96 12 78 12 58 L12 26 Z"
        fill="#0B1120"
      />

      {/* A monogram — left stroke */}
      <Path
        d="M34 88 L50 32 L66 88"
        stroke="url(#goldGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* A monogram — crossbar */}
      <Path
        d="M39 68 L61 68"
        stroke="url(#goldGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}
```

**Step 2: Update `src/components/ui/GlassCard.tsx`**

```typescript
import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'

interface Props {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  glow?: string
  gold?: boolean   // gold-tinted border variant
}

export default function GlassCard({ children, style, glow, gold }: Props) {
  return (
    <View
      style={[
        styles.card,
        glow ? { shadowColor: glow, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8 } : styles.shadow,
        gold ? styles.goldBorder : styles.defaultBorder,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  defaultBorder: { borderColor: colors.border },
  goldBorder:    { borderColor: colors.borderBright },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },
})
```

**Step 3: Update `src/components/ui/GradientButton.tsx`**

```typescript
import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native'
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
  variant?: 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function GradientButton({
  label, onPress, loading, disabled, style,
  gradient, variant = 'primary', size = 'lg',
}: Props) {
  const scale = useSharedValue(1)

  const gradColors = (gradient ||
    (variant === 'danger' ? [colors.danger, '#FF6B63'] :
     variant === 'ghost'  ? [colors.bgCard, colors.bgElevated] :
     colors.gradientGold)) as [string, string, ...string[]]

  const textColor = variant === 'ghost' ? colors.textGold : '#0B1120'
  const paddingV = size === 'lg' ? 18 : size === 'md' ? 14 : 10

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
        colors={gradColors}
        style={[styles.gradient, { paddingVertical: paddingV }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading
          ? <ActivityIndicator color={textColor} />
          : <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        }
      </LinearGradient>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  wrapper:  { borderRadius: 28, overflow: 'hidden' },
  gradient: { alignItems: 'center', justifyContent: 'center' },
  label:    { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
})
```

**Step 4: Update `src/components/ui/index.ts`**

```typescript
export { default as GlassCard }      from './GlassCard'
export { default as GradientButton } from './GradientButton'
export { default as AnimatedNumber } from './AnimatedNumber'
export { default as GradientText }   from './GradientText'
export { default as ShieldLogo }     from './ShieldLogo'
```

**Step 5: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

## Phase 2: Tab Bar + Navigation

### Task 3: Tab bar with Ionicons + gold active state

**Files:**
- Modify: `advocate/src/navigation/AppNavigator.tsx`

**Step 1: Replace AppNavigator.tsx**

```typescript
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import MyCasesScreen from '../screens/MyCasesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import NewCaseScreen from '../screens/NewCaseScreen'
import CaseAnalysisScreen from '../screens/CaseAnalysisScreen'
import DemandLetterScreen from '../screens/DemandLetterScreen'
import PhoneScriptScreen from '../screens/PhoneScriptScreen'
import OutcomeTrackerScreen from '../screens/OutcomeTrackerScreen'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Home:     { active: 'home',       inactive: 'home-outline' },
  MyCases:  { active: 'briefcase',  inactive: 'briefcase-outline' },
  Settings: { active: 'settings',   inactive: 'settings-outline' },
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   colors.goldPrimary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name]
          const name = focused ? icons.active : icons.inactive
          return (
            <View style={styles.iconWrap}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons name={name} size={22} color={color} />
            </View>
          )
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyCases"  component={MyCasesScreen}  options={{ tabBarLabel: 'My Cases' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"          component={HomeTabs} />
      <Stack.Screen name="NewCase"       component={NewCaseScreen} />
      <Stack.Screen name="CaseAnalysis"  component={CaseAnalysisScreen} />
      <Stack.Screen name="DemandLetter"  component={DemandLetterScreen} />
      <Stack.Screen name="PhoneScript"   component={PhoneScriptScreen} />
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
    position:     'absolute',
    top:          0,
    width:        32,
    height:       3,
    borderRadius: 2,
    backgroundColor: colors.goldPrimary,
  },
})
```

**Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

---

## Phase 3: Core Screens

### Task 4: Redesign Onboarding Screen 1

**Files:**
- Modify: `advocate/src/screens/onboarding/OnboardingScreen1.tsx`

**Step 1: Replace OnboardingScreen1.tsx**

```typescript
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, Dimensions, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, FadeInDown
} from 'react-native-reanimated'
import { colors } from '../../theme/colors'
import { GradientButton, ShieldLogo } from '../../components/ui'

const { height, width } = Dimensions.get('window')

interface Props { onNext: () => void }

export default function OnboardingScreen1({ onNext }: Props) {
  const badgeOpacity = useSharedValue(0)
  const badgeY = useSharedValue(-12)

  useEffect(() => {
    badgeOpacity.value = withDelay(300, withTiming(1, { duration: 700 }))
    badgeY.value = withDelay(300, withSpring(0, { damping: 18 }))
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
      {/* Gold radial glow */}
      <View style={styles.glow} />

      <SafeAreaView style={styles.inner}>
        {/* Logo + badge row */}
        <Animated.View style={[styles.logoRow, badgeStyle]}>
          <ShieldLogo size={36} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>⚡ AI-POWERED LEGAL RIGHTS</Text>
          </View>
        </Animated.View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.heroBlock}>
          <Text style={styles.heroTop}>Americans lose</Text>
          <Text style={styles.heroAmount}>$300–800</Text>
          <Text style={styles.heroBottom}>per year to unfair charges.</Text>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(600).duration(600)} style={styles.body}>
          Withheld deposits. Unauthorized subscriptions. Denied refunds.{' '}
          <Text style={styles.bodyBold}>You have rights. It's time to use them.</Text>
        </Animated.Text>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.statsRow}>
          {[
            { display: '$2.3M', label: 'Recovered' },
            { display: '94%',   label: 'Win rate' },
            { display: '60s',   label: 'To letter' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statNum}>{s.display}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.cta}>
          <GradientButton label="Get What You're Owed →" onPress={onNext} />
          <Text style={styles.ctaSub}>Free to try · No credit card needed</Text>
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
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(201,168,76,0.07)',
  },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 40 },
  badge: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.30)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  badgeText:   { color: colors.goldBright, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  heroBlock:   { marginBottom: 20 },
  heroTop:     { fontSize: 20, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  heroAmount: {
    fontSize: 64, fontWeight: '900', color: colors.goldPrimary,
    letterSpacing: -2, lineHeight: 72,
  },
  heroBottom:  { fontSize: 20, fontWeight: '600', color: colors.textSecondary },
  body:        { fontSize: 16, color: colors.textSecondary, lineHeight: 26, marginBottom: 32 },
  bodyBold:    { color: colors.text, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: 'auto' as any,
  },
  statItem:   { alignItems: 'center', flex: 1 },
  statNum:    { fontSize: 22, fontWeight: '900', color: colors.goldBright, marginBottom: 4 },
  statLabel:  { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  cta:        { paddingBottom: 24 },
  ctaSub:     { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
})
```

---

### Task 5: Redesign Home Dashboard

**Files:**
- Modify: `advocate/src/screens/HomeScreen.tsx`

**Step 1: Replace HomeScreen.tsx**

```typescript
import React, { useCallback, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, StatusBar
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import { GlassCard, GradientButton, ShieldLogo } from '../components/ui'
import { getUserCases } from '../api/cases'

const CAT: Record<string, { label: string; color: string; icon: string }> = {
  deposit:  { label: 'Security Deposit',     color: '#4F6EFF', icon: '🏠' },
  charges:  { label: 'Unauthorized Charges', color: '#FF453A', icon: '💳' },
  travel:   { label: 'Flight / Travel',      color: '#00B4D8', icon: '✈️' },
  invoice:  { label: 'Unpaid Invoice',       color: '#FF9F0A', icon: '💼' },
  product:  { label: 'Defective Product',    color: '#32D74B', icon: '📦' },
}

export default function HomeScreen({ navigation }: any) {
  const [cases, setCases]       = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    try { setCases(await getUserCases() || []) } catch {}
  }

  useFocusEffect(useCallback(() => { load() }, []))

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false) }

  const active    = cases.filter(c => c.status === 'active')
  const won       = cases.filter(c => c.outcome === 'won')
  const recovered = cases.filter(c => c.outcome === 'won' && c.amount_disputed)
    .reduce((s, c) => s + c.amount_disputed, 0)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F1E3A', colors.bgScreen]}
        style={styles.headerGrad}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.goldPrimary} />}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View style={styles.logoRow}>
              <ShieldLogo size={32} />
              <View>
                <Text style={styles.appName}>Advocate</Text>
                <Text style={styles.tagline}>Know your rights. Fight back. Win.</Text>
              </View>
            </View>
          </Animated.View>

          {/* Stat cards */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
            <GlassCard style={styles.stat}>
              <Text style={styles.statNum}>{active.length}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </GlassCard>
            <GlassCard style={styles.stat} glow={colors.goldPrimary} gold>
              <Text style={[styles.statNum, styles.statNumGold]}>
                {recovered > 0 ? `$${(recovered/1000).toFixed(1)}K` : '$0'}
              </Text>
              <Text style={styles.statLabel}>Recovered</Text>
            </GlassCard>
            <GlassCard style={styles.stat}>
              <Text style={styles.statNum}>{won.length}</Text>
              <Text style={styles.statLabel}>Won</Text>
            </GlassCard>
          </Animated.View>

          {/* New Case CTA */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.ctaWrap}>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewCase')}
              activeOpacity={0.9}
              style={styles.ctaTouch}
            >
              <LinearGradient
                colors={colors.gradientGold as [string,string,string]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flash" size={26} color={colors.bgScreen} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ctaTitle}>Start New Case</Text>
                  <Text style={styles.ctaSub}>Demand letter in 60 seconds</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={colors.bgScreen} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Active cases list */}
          {active.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Text style={styles.sectionTitle}>ACTIVE CASES</Text>
              {active.slice(0, 4).map(c => {
                const meta = CAT[c.category] || { label: c.category, color: colors.goldPrimary, icon: '⚖️' }
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => navigation.navigate('OutcomeTracker', { caseId: c.id, analysis: null })}
                    activeOpacity={0.85}
                  >
                    <GlassCard style={styles.caseCard}>
                      <View style={[styles.caseStrip, { backgroundColor: meta.color }]} />
                      <View style={styles.caseBody}>
                        <Text style={[styles.caseCat, { color: meta.color }]}>
                          {meta.icon} {meta.label}
                        </Text>
                        {c.amount_disputed > 0 && (
                          <Text style={styles.caseAmt}>${c.amount_disputed.toLocaleString()}</Text>
                        )}
                        <Text style={styles.caseDesc} numberOfLines={2}>{c.description}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ margin: 16 }} />
                    </GlassCard>
                  </TouchableOpacity>
                )
              })}
            </Animated.View>
          )}

          {/* Empty state */}
          {cases.length === 0 && (
            <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.empty}>
              <ShieldLogo size={64} />
              <Text style={styles.emptyTitle}>You're protected.</Text>
              <Text style={styles.emptySub}>
                Start your first case above.{'\n'}Most disputes resolve within 2 weeks.
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.bgScreen },
  headerGrad:  { position: 'absolute', top: 0, left: 0, right: 0, height: 240 },
  safe:        { flex: 1 },
  content:     { paddingHorizontal: 20, paddingBottom: 40 },
  header:      { paddingTop: 8, paddingBottom: 20 },
  logoRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appName:     { fontSize: 22, fontWeight: '700', color: colors.goldBright, letterSpacing: -0.3 },
  tagline:     { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 20 },
  stat:        { flex: 1, padding: 16, alignItems: 'center' },
  statNum:     { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4 },
  statNumGold: { color: colors.goldBright },
  statLabel:   { fontSize: 11, color: colors.textMuted },
  ctaWrap:     { marginBottom: 28 },
  ctaTouch:    { borderRadius: 20, overflow: 'hidden' },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
  ctaTitle:    { fontSize: 17, fontWeight: '800', color: colors.bgScreen, marginBottom: 2 },
  ctaSub:      { fontSize: 12, color: 'rgba(8,12,20,0.65)' },
  sectionTitle:{ fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  caseCard:    { marginBottom: 10, flexDirection: 'row', alignItems: 'center', padding: 0, overflow: 'hidden' },
  caseStrip:   { width: 4, alignSelf: 'stretch' },
  caseBody:    { flex: 1, padding: 14 },
  caseCat:     { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  caseAmt:     { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 3 },
  caseDesc:    { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  empty:       { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyTitle:  { fontSize: 22, fontWeight: '800', color: colors.goldBright },
  emptySub:    { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
```

---

### Task 6: Update Auth Screen + Paywall

**Files:**
- Modify: `advocate/src/screens/AuthScreen.tsx`
- Modify: `advocate/src/screens/PaywallScreen.tsx`

**Step 1: Update AuthScreen.tsx — logo + color tokens**

In `AuthScreen.tsx`:
- Replace `<Text style={styles.logoEmoji}>⚖️</Text>` with `<ShieldLogo size={56} />`
- Add import: `import { ShieldLogo } from '../components/ui'`
- Update container background to `colors.bgScreen`
- Update input `backgroundColor` to `colors.bgCard`
- Update input `borderColor` to `colors.borderWhite`
- Update focused input border to `colors.goldPrimary`
- Update `appName` color to `colors.goldBright`
- Update `toggleLink` color to `colors.goldPrimary`
- Change gradient in background to `['#0F1E3A', '#0B1120', '#080C14']`

**Step 2: Update PaywallScreen.tsx — gold badge + button label color**

In `PaywallScreen.tsx`:
- Change `GradientButton` text color: The gold gradient button label should be `#0B1120` (dark navy), not white. Pass `gradient={colors.gradientGold}` and add `labelColor` prop or just update the button — since `GradientButton` now sets text to `#0B1120` for primary variant, this is automatic.
- Update background gradient to `['#0F1E3A', '#0B1120', colors.bgScreen]`

---

### Task 7: Update remaining screens to new tokens

**Files:**
- Modify: `advocate/src/screens/CaseAnalysisScreen.tsx`
- Modify: `advocate/src/screens/MyCasesScreen.tsx`
- Modify: `advocate/src/screens/SettingsScreen.tsx`
- Modify: `advocate/src/screens/onboarding/OnboardingScreen2.tsx`
- Modify: `advocate/src/screens/onboarding/OnboardingScreen3.tsx`

For each screen, find and replace these color patterns (the color aliases in the new `colors.ts` ensure most things work already, but these specific tweaks make screens look polished):

**CaseAnalysisScreen.tsx:**
- Recovery amount text color: `colors.goldBright` (was `colors.accent`)
- Recovery card glow: `colors.goldPrimary` (was `colors.accent`)
- Recovery gradient: `[colors.accentDim, 'transparent']` → `['rgba(201,168,76,0.15)', 'transparent']`
- Back button color: `colors.goldPrimary`

**MyCasesScreen.tsx:**
- Active filter pill gradient: already `gradientGold` via new `gradientPrimary` alias ✓
- Recovered banner: `glow={colors.goldPrimary}` and `gold` prop on GlassCard

**SettingsScreen.tsx:**
- Pro badge gradient: already `gradientPrimary` which now maps to gold ✓
- Section label colors: `colors.textGold` for key labels

**OnboardingScreen2.tsx:**
- Step label: `colors.goldPrimary`
- Selected category border: category-specific color (keep as-is ✓)
- CTA: GradientButton already uses gold gradient ✓

**OnboardingScreen3.tsx:**
- Step label: `colors.goldPrimary`
- GlassCard cards look great with new gold borders ✓

**Step: Verify TypeScript after all changes**
```bash
cd E:/new_apps/advocate && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors

---

### Task 8: Status bar + metro web stub for react-native-svg

**Files:**
- Modify: `advocate/metro.config.js`
- Modify: `advocate/src/stubs/react-native-svg.js` (create)

**Step 1: Create SVG stub for web**

`src/stubs/react-native-svg.js`:
```javascript
const React = require('react')
const Svg = ({ children }) => React.createElement('svg', null, children)
Svg.default = Svg
module.exports = Svg
module.exports.default = Svg
module.exports.Svg = Svg
module.exports.Path = () => null
module.exports.Defs = () => null
module.exports.LinearGradient = () => null
module.exports.Stop = () => null
module.exports.G = () => null
module.exports.Circle = () => null
module.exports.Rect = () => null
module.exports.Text = () => null
```

**Step 2: Add to metro.config.js resolver**

In `metro.config.js`, in the `resolveRequest` function, add `react-native-svg` to the web stubs map alongside the existing ones:

```javascript
const WEB_STUBS = {
  'react-native-purchases':        path.resolve(__dirname, 'src/stubs/react-native-purchases.js'),
  'react-native-html-to-pdf':      path.resolve(__dirname, 'src/stubs/react-native-html-to-pdf.js'),
  'react-native-share':            path.resolve(__dirname, 'src/stubs/react-native-share.js'),
  'react-native-document-picker':  path.resolve(__dirname, 'src/stubs/react-native-document-picker.js'),
  'mixpanel-react-native':         path.resolve(__dirname, 'src/stubs/mixpanel-react-native.js'),
  'react-native-svg':              path.resolve(__dirname, 'src/stubs/react-native-svg.js'),
}
```

**Step 3: Final TypeScript check + reload**
```bash
npx tsc --noEmit 2>&1 | head -20
```
Then press `r` in the Expo terminal to reload.

Expected: App loads with gold shield logo, gold tab icons, deep navy backgrounds, gold gradient buttons.

---

## Verification Checklist

After all tasks, the app should show:
- [ ] Deep navy `#0B1120` background on all screens (not near-black indigo)
- [ ] Gold shield + "A" monogram in top-left of Home and Auth screens
- [ ] Bottom tab bar: house/briefcase/settings icons, gold when active, gold top-bar indicator
- [ ] All primary buttons: 3-stop gold gradient (`#8B7235→#C9A84C→#E4BF6A`) with DARK navy text
- [ ] Glass cards: navy background `rgba(17,24,39,0.75)` with gold-tinted border
- [ ] Recovered stat card has gold glow
- [ ] Onboarding hero amount `$300-800` in gold
- [ ] No TypeScript errors
