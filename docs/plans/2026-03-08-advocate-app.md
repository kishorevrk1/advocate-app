# Advocate App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build "Advocate" — an AI-powered Android-first consumer rights app that generates demand letters, phone scripts, and escalation guides using Claude AI, monetized via RevenueCat subscriptions.

**Architecture:** React Native (Expo) mobile app communicating with a Node.js/Express REST API hosted on Railway. The backend handles all Claude API calls and PDF generation. Supabase handles auth, database, and file storage. RevenueCat manages Android subscriptions.

**Tech Stack:** React Native + Expo, Node.js + Express, Supabase, Claude API (claude-sonnet-4-6), RevenueCat, Railway, Mixpanel, React Navigation, React Native HTML to PDF

---

## Phase 1: Foundation

### Task 1: Initialize Expo Project + Install Dependencies

**Files:**
- Create: `advocate/` (project root)
- Create: `advocate/package.json` (auto-generated)
- Create: `advocate/app.json`

**Step 1: Create Expo project**

```bash
cd E:/new_apps
npx create-expo-app advocate --template blank-typescript
cd advocate
```

**Step 2: Install all dependencies at once**

```bash
npx expo install expo-router expo-status-bar expo-font expo-splash-screen
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npm install @supabase/supabase-js
npm install react-native-purchases
npm install mixpanel-react-native
npm install react-native-html-to-pdf
npm install react-native-document-picker
npm install react-native-share
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install axios
npm install react-native-reanimated react-native-gesture-handler
npm install zustand
npm install react-hook-form
```

**Step 3: Verify project starts**

```bash
npx expo start
```
Expected: QR code shown, no errors

**Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Expo project with all dependencies"
```

---

### Task 2: Supabase Project Setup

**Files:**
- Create: `advocate/src/lib/supabase.ts`
- Create: `advocate/src/lib/database.types.ts`

**Step 1: Create Supabase project**

1. Go to https://supabase.com → New project
2. Name: `advocate-app`
3. Save your: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Step 2: Run this SQL in Supabase SQL Editor**

```sql
-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  subscription_status text default 'free',
  plan_type text default 'free',
  total_recovered numeric default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Cases table
create table public.cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  description text not null,
  status text default 'active',
  opponent_name text,
  amount_disputed numeric,
  state text,
  outcome text,
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

alter table public.cases enable row level security;
create policy "Users can CRUD own cases" on public.cases
  for all using (auth.uid() = user_id);

-- Documents table (letters, scripts)
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  type text not null, -- 'letter' | 'script' | 'complaint'
  content jsonb,
  pdf_url text,
  created_at timestamp with time zone default now()
);

alter table public.documents enable row level security;
create policy "Users can CRUD own documents" on public.documents
  for all using (
    auth.uid() = (select user_id from public.cases where id = case_id)
  );

-- Escalation steps table
create table public.escalation_steps (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references public.cases(id) on delete cascade,
  step_number integer not null,
  action_type text not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  notes text
);

alter table public.escalation_steps enable row level security;
create policy "Users can CRUD own steps" on public.escalation_steps
  for all using (
    auth.uid() = (select user_id from public.cases where id = case_id)
  );
```

**Step 3: Create Supabase client**

Create `advocate/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

**Step 4: Create `.env` file**

Create `advocate/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Add `.env` to `.gitignore`.

**Step 5: Commit**

```bash
git add src/lib/supabase.ts .gitignore
git commit -m "feat: add Supabase client and database schema"
```

---

### Task 3: App Navigation Structure

**Files:**
- Create: `advocate/src/navigation/RootNavigator.tsx`
- Create: `advocate/src/navigation/AppNavigator.tsx`
- Create: `advocate/src/store/authStore.ts`
- Modify: `advocate/App.tsx`

**Step 1: Create auth store with Zustand**

Create `advocate/src/store/authStore.ts`:

```typescript
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: any | null
  session: any | null
  hasSeenOnboarding: boolean
  isLoading: boolean
  setUser: (user: any) => void
  setSession: (session: any) => void
  setHasSeenOnboarding: (seen: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  hasSeenOnboarding: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isLoading: false }),
  setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, hasSeenOnboarding: false })
  },
}))
```

**Step 2: Create Root Navigator**

Create `advocate/src/navigation/RootNavigator.tsx`:

```typescript
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import OnboardingNavigator from './OnboardingNavigator'
import AppNavigator from './AppNavigator'
import AuthScreen from '../screens/AuthScreen'

const Stack = createStackNavigator()

export default function RootNavigator() {
  const { session, setSession, setUser, hasSeenOnboarding } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })
  }, [])

  if (!session) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!hasSeenOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          )}
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  )
}
```

**Step 3: Create App Navigator (bottom tabs)**

Create `advocate/src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import MyCasesScreen from '../screens/MyCasesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import NewCaseScreen from '../screens/NewCaseScreen'
import CaseAnalysisScreen from '../screens/CaseAnalysisScreen'
import DemandLetterScreen from '../screens/DemandLetterScreen'
import PhoneScriptScreen from '../screens/PhoneScriptScreen'
import OutcomeTrackerScreen from '../screens/OutcomeTrackerScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyCases" component={MyCasesScreen} options={{ title: 'My Cases' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      <Stack.Screen name="NewCase" component={NewCaseScreen} />
      <Stack.Screen name="CaseAnalysis" component={CaseAnalysisScreen} />
      <Stack.Screen name="DemandLetter" component={DemandLetterScreen} />
      <Stack.Screen name="PhoneScript" component={PhoneScriptScreen} />
      <Stack.Screen name="OutcomeTracker" component={OutcomeTrackerScreen} />
    </Stack.Navigator>
  )
}
```

**Step 4: Create placeholder screens so navigation compiles**

Create `advocate/src/screens/HomeScreen.tsx`:
```typescript
import React from 'react'
import { View, Text } from 'react-native'
export default function HomeScreen() {
  return <View><Text>Home</Text></View>
}
```

Repeat for: `AuthScreen`, `MyCasesScreen`, `SettingsScreen`, `NewCaseScreen`, `CaseAnalysisScreen`, `DemandLetterScreen`, `PhoneScriptScreen`, `OutcomeTrackerScreen`

**Step 5: Update App.tsx**

```typescript
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  )
}
```

**Step 6: Run to verify no navigation errors**

```bash
npx expo start
```
Expected: App loads on Home screen with bottom tabs visible

**Step 7: Commit**

```bash
git add src/ App.tsx
git commit -m "feat: add full navigation structure with placeholder screens"
```

---

## Phase 2: Onboarding + Paywall

### Task 4: Onboarding Screens (5 Screens)

**Files:**
- Create: `advocate/src/navigation/OnboardingNavigator.tsx`
- Create: `advocate/src/screens/onboarding/OnboardingScreen1.tsx` through `OnboardingScreen5.tsx`
- Create: `advocate/src/theme/colors.ts`

**Step 1: Create theme colors**

Create `advocate/src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#1B4FFF',       // Deep blue — trust, authority
  primaryDark: '#0D2ECC',
  accent: '#00D4AA',        // Teal — success, money recovered
  danger: '#FF3B30',        // Red — flagged clauses, urgency
  warning: '#FF9500',       // Orange — escalation needed
  background: '#0A0A0F',    // Near black — premium feel
  surface: '#14141F',       // Dark surface
  surfaceLight: '#1E1E2E',  // Slightly lighter surface
  border: '#2A2A3E',        // Subtle borders
  text: '#FFFFFF',
  textSecondary: '#8888AA',
  textMuted: '#555570',
  success: '#30D158',
}
```

**Step 2: Create Onboarding Screen 1 — Hook**

Create `advocate/src/screens/onboarding/OnboardingScreen1.tsx`:

```typescript
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { colors } from '../../theme/colors'

const { width, height } = Dimensions.get('window')

interface Props {
  onNext: () => void
}

export default function OnboardingScreen1({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⚡ AI-POWERED</Text>
      </View>

      <Text style={styles.headline}>
        Americans lose{'\n'}
        <Text style={styles.highlight}>$300–800/year</Text>
        {'\n'}to unfair charges.
      </Text>

      <Text style={styles.subheadline}>
        Unauthorized subscriptions. Withheld deposits.{'\n'}
        Denied refunds. You have rights.{'\n'}
        <Text style={styles.bold}>It's time to use them.</Text>
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>$2.3M</Text>
          <Text style={styles.statLabel}>Recovered this month</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>94%</Text>
          <Text style={styles.statLabel}>Success rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>60s</Text>
          <Text style={styles.statLabel}>To your letter</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>Get What You're Owed →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  badge: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 50,
    marginBottom: 20,
  },
  highlight: {
    color: colors.accent,
  },
  subheadline: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 40,
  },
  bold: {
    color: colors.text,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
})
```

**Step 3: Create Onboarding Screen 2 — Category Picker**

Create `advocate/src/screens/onboarding/OnboardingScreen2.tsx`:

```typescript
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { colors } from '../../theme/colors'

const CATEGORIES = [
  { id: 'deposit', emoji: '🏠', title: 'Security Deposit', subtitle: 'Landlord keeping your money' },
  { id: 'charges', emoji: '💳', title: 'Unauthorized Charges', subtitle: 'Subscription or billing fraud' },
  { id: 'travel', emoji: '✈️', title: 'Flight / Travel Refunds', subtitle: 'Cancelled or delayed flights' },
  { id: 'invoice', emoji: '💼', title: 'Unpaid Invoice', subtitle: 'Client not paying what\'s owed' },
  { id: 'product', emoji: '📦', title: 'Defective Product', subtitle: 'Return denied or product broken' },
]

interface Props {
  onNext: (category: string) => void
}

export default function OnboardingScreen2({ onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <View style={styles.container}>
      <Text style={styles.step}>STEP 1 OF 3</Text>
      <Text style={styles.title}>What's your situation?</Text>
      <Text style={styles.subtitle}>Pick the closest match — we'll tailor everything to your case.</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, selected === cat.id && styles.cardSelected]}
            onPress={() => setSelected(cat.id)}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, selected === cat.id && styles.cardTitleSelected]}>
                {cat.title}
              </Text>
              <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
            </View>
            {selected === cat.id && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={() => selected && onNext(selected)}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 28, paddingTop: 60 },
  step: { fontSize: 12, color: colors.primary, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 10 },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: 28, lineHeight: 22 },
  list: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  emoji: { fontSize: 28, marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 3 },
  cardTitleSelected: { color: colors.primary },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary },
  check: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  button: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 16,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
})
```

**Step 4: Create Onboarding Screen 3 — Promise Screen**

Create `advocate/src/screens/onboarding/OnboardingScreen3.tsx`:

```typescript
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from '../../theme/colors'

const STEPS = [
  { icon: '⚖️', title: 'Know Your Rights', desc: 'We identify exactly which laws apply to your situation' },
  { icon: '📝', title: 'Draft Your Letter', desc: 'A professional demand letter in 60 seconds, ready to send' },
  { icon: '📞', title: 'Script Your Call', desc: 'Know exactly what to say when you call them' },
  { icon: '🎯', title: 'Track to Victory', desc: 'Step-by-step escalation until you win' },
]

interface Props {
  onNext: () => void
}

export default function OnboardingScreen3({ onNext }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.step}>STEP 2 OF 3</Text>
      <Text style={styles.title}>Here's how we{'\n'}fight for you.</Text>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{s.icon}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ℹ️ Advocate provides legal information, not legal advice. For complex matters, consult a licensed attorney.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onNext}>
        <Text style={styles.buttonText}>See Pricing →</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 28, paddingTop: 60 },
  step: { fontSize: 12, color: colors.primary, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, marginBottom: 32, lineHeight: 42 },
  steps: { flex: 1 },
  stepRow: { flexDirection: 'row', marginBottom: 28 },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  icon: { fontSize: 24 },
  stepText: { flex: 1, justifyContent: 'center' },
  stepTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 4 },
  stepDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  disclaimer: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border,
  },
  disclaimerText: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  button: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
})
```

**Step 5: Create Onboarding Navigator**

Create `advocate/src/navigation/OnboardingNavigator.tsx`:

```typescript
import React, { useState } from 'react'
import { View } from 'react-native'
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1'
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2'
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3'
import PaywallScreen from '../screens/PaywallScreen'
import { useAuthStore } from '../store/authStore'

export default function OnboardingNavigator({ navigation }: any) {
  const [step, setStep] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const { setHasSeenOnboarding } = useAuthStore()

  const screens = [
    <OnboardingScreen1 onNext={() => setStep(1)} />,
    <OnboardingScreen2 onNext={(cat) => { setSelectedCategory(cat); setStep(2) }} />,
    <OnboardingScreen3 onNext={() => setStep(3)} />,
    <PaywallScreen onSuccess={() => {
      setHasSeenOnboarding(true)
      navigation.replace('Auth')
    }} />,
  ]

  return <View style={{ flex: 1 }}>{screens[step]}</View>
}
```

**Step 6: Commit**

```bash
git add src/screens/onboarding/ src/navigation/OnboardingNavigator.tsx src/theme/
git commit -m "feat: add onboarding screens with category picker"
```

---

### Task 5: RevenueCat Paywall + Auth Screen

**Files:**
- Create: `advocate/src/screens/PaywallScreen.tsx`
- Create: `advocate/src/screens/AuthScreen.tsx`
- Create: `advocate/src/lib/purchases.ts`

**Step 1: Set up RevenueCat**

1. Create account at https://app.revenuecat.com
2. Add Android app → get your `REVENUECAT_API_KEY`
3. Create Products in Google Play Console:
   - `advocate_pro_monthly` — $9.99/month
   - `advocate_pro_annual` — $69.99/year
4. Create Entitlement: `pro` → attach both products
5. Create Offering: `default` → attach both packages

**Step 2: Create purchases lib**

Create `advocate/src/lib/purchases.ts`:

```typescript
import Purchases, { PurchasesPackage } from 'react-native-purchases'

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY!

export const initializePurchases = (userId?: string) => {
  Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId })
}

export const getOfferings = async () => {
  const offerings = await Purchases.getOfferings()
  return offerings.current
}

export const purchasePackage = async (pkg: PurchasesPackage) => {
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return customerInfo.entitlements.active['pro'] !== undefined
}

export const restorePurchases = async () => {
  const customerInfo = await Purchases.restorePurchases()
  return customerInfo.entitlements.active['pro'] !== undefined
}

export const checkProStatus = async () => {
  const customerInfo = await Purchases.getCustomerInfo()
  return customerInfo.entitlements.active['pro'] !== undefined
}
```

**Step 3: Create PaywallScreen**

Create `advocate/src/screens/PaywallScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert
} from 'react-native'
import { PurchasesPackage } from 'react-native-purchases'
import { colors } from '../theme/colors'
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases'

interface Props {
  onSuccess: () => void
}

export default function PaywallScreen({ onSuccess }: Props) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    getOfferings().then((offering) => {
      if (offering) {
        setPackages(offering.availablePackages)
        // Pre-select annual (highest LTV)
        const annual = offering.availablePackages.find(p => p.packageType === 'ANNUAL')
        setSelectedPkg(annual || offering.availablePackages[0])
      }
      setLoading(false)
    })
  }, [])

  const handlePurchase = async () => {
    if (!selectedPkg) return
    setPurchasing(true)
    try {
      const isPro = await purchasePackage(selectedPkg)
      if (isPro) onSuccess()
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Purchase failed', e.message)
    }
    setPurchasing(false)
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.step}>STEP 3 OF 3</Text>
      <Text style={styles.title}>Start Fighting Back Today</Text>
      <Text style={styles.subtitle}>7-day free trial. Cancel anytime.</Text>

      <View style={styles.features}>
        {[
          '✓  Unlimited cases',
          '✓  Professional demand letters (PDF)',
          '✓  Phone call scripts',
          '✓  Step-by-step escalation tracker',
          '✓  State-specific legal rights',
          '✓  AI-powered case analysis',
        ].map((f, i) => (
          <Text key={i} style={styles.feature}>{f}</Text>
        ))}
      </View>

      <View style={styles.packages}>
        {packages.map((pkg) => {
          const isAnnual = pkg.packageType === 'ANNUAL'
          const isSelected = selectedPkg?.identifier === pkg.identifier
          return (
            <TouchableOpacity
              key={pkg.identifier}
              style={[styles.package, isSelected && styles.packageSelected]}
              onPress={() => setSelectedPkg(pkg)}
            >
              {isAnnual && <View style={styles.bestValue}><Text style={styles.bestValueText}>BEST VALUE — SAVE 40%</Text></View>}
              <Text style={[styles.packageTitle, isSelected && styles.packageTitleSelected]}>
                {isAnnual ? 'Annual' : 'Monthly'}
              </Text>
              <Text style={styles.packagePrice}>
                {pkg.product.priceString}{isAnnual ? '/year' : '/month'}
              </Text>
              {isAnnual && <Text style={styles.packageNote}>= $5.83/month</Text>}
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity style={styles.cta} onPress={handlePurchase} disabled={purchasing}>
        {purchasing
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.ctaText}>Start Free Trial →</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={restorePurchases} style={styles.restore}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        Subscription auto-renews. Cancel anytime in Google Play settings.
        This is an informational tool, not legal advice.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 28, paddingTop: 60 },
  center: { alignItems: 'center', justifyContent: 'center' },
  step: { fontSize: 12, color: colors.primary, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.accent, fontWeight: '600', marginBottom: 28 },
  features: { marginBottom: 28 },
  feature: { fontSize: 15, color: colors.text, marginBottom: 12, lineHeight: 22 },
  packages: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  package: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center',
  },
  packageSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  bestValue: {
    backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 8,
    paddingVertical: 3, marginBottom: 8,
  },
  bestValueText: { fontSize: 9, fontWeight: '800', color: colors.background },
  packageTitle: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  packageTitleSelected: { color: colors.primary },
  packagePrice: { fontSize: 18, fontWeight: '800', color: colors.text },
  packageNote: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  cta: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginBottom: 16,
  },
  ctaText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  restore: { alignItems: 'center', marginBottom: 20 },
  restoreText: { color: colors.textSecondary, fontSize: 14 },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
})
```

**Step 4: Create AuthScreen (Google + Email sign-in)**

Create `advocate/src/screens/AuthScreen.tsx`:

```typescript
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { colors } from '../theme/colors'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.logo}>⚖️ Advocate</Text>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background, padding: 28,
    justifyContent: 'center',
  },
  logo: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    fontSize: 16, color: colors.text, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  toggle: { alignItems: 'center', marginTop: 24 },
  toggleText: { color: colors.textSecondary, fontSize: 14 },
})
```

**Step 5: Commit**

```bash
git add src/screens/PaywallScreen.tsx src/screens/AuthScreen.tsx src/lib/purchases.ts
git commit -m "feat: add paywall screen and auth screen"
```

---

## Phase 3: Backend API

### Task 6: Node.js Backend Setup

**Files:**
- Create: `advocate-api/` (separate folder)
- Create: `advocate-api/package.json`
- Create: `advocate-api/src/index.ts`
- Create: `advocate-api/.env`

**Step 1: Initialize backend**

```bash
cd E:/new_apps
mkdir advocate-api && cd advocate-api
npm init -y
npm install express cors dotenv @anthropic-ai/sdk
npm install -D typescript ts-node @types/express @types/node nodemon
npx tsc --init
```

**Step 2: Create `.env` for backend**

```
PORT=3001
ANTHROPIC_API_KEY=your_claude_api_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**Step 3: Create `src/index.ts`**

```typescript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import casesRouter from './routes/cases'
import generateRouter from './routes/generate'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/cases', casesRouter)
app.use('/api/generate', generateRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Advocate API running on port ${PORT}`))
```

**Step 4: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Step 5: Start dev server**

```bash
npm run dev
```
Expected: `Advocate API running on port 3001`

**Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Node.js Express backend"
```

---

### Task 7: Claude API Integration — Case Analysis Endpoint

**Files:**
- Create: `advocate-api/src/routes/generate.ts`
- Create: `advocate-api/src/lib/claude.ts`
- Create: `advocate-api/src/data/laws.ts`

**Step 1: Create US state laws reference data**

Create `advocate-api/src/data/laws.ts`:

```typescript
export const stateLaws: Record<string, Record<string, string[]>> = {
  CA: {
    deposit: [
      'California Civil Code § 1950.5: Landlord must return deposit within 21 days',
      'Maximum deposit is 2 months rent (unfurnished)',
      'Itemized statement required for any deductions',
    ],
    charges: [
      'California Business and Professions Code § 17200: Unfair business practices',
      'CFPB Regulation E: Unauthorized electronic fund transfers must be disputed within 60 days',
    ],
  },
  TX: {
    deposit: [
      'Texas Property Code § 92.103: Landlord must return deposit within 30 days',
      'Written itemized list required for deductions',
      'Landlord liable for 3x deposit + $100 + attorney fees if wrongfully withheld',
    ],
    charges: [
      'Texas Business and Commerce Code § 17.46: Deceptive trade practices',
      'CFPB Regulation E applies federally',
    ],
  },
  NY: {
    deposit: [
      'New York General Obligations Law § 7-108: Return within 14 days (NYC) or 30 days',
      'Maximum deposit is 1 month rent (NYC)',
      'Interest required on deposits held over 1 year',
    ],
    charges: [
      'New York General Business Law § 349: Deceptive acts and practices',
    ],
  },
  FL: {
    deposit: [
      'Florida Statute § 83.49: Landlord must return deposit within 15-60 days',
      'Must send written notice of any claims within 30 days',
    ],
    charges: [
      'Florida Deceptive and Unfair Trade Practices Act (FDUTPA)',
      'CFPB Regulation E applies federally',
    ],
  },
  // Add all 50 states — use FEDERAL as fallback
  FEDERAL: {
    deposit: [
      'Federal law does not regulate security deposits — check your state',
      'CFPB complaint available at consumerfinance.gov/complaint',
    ],
    charges: [
      'CFPB Regulation E: Unauthorized electronic fund transfers',
      'Fair Credit Billing Act (FCBA): Credit card disputes within 60 days',
      'FTC Act Section 5: Unfair or deceptive acts or practices',
    ],
    travel: [
      'DOT Rule: Airline must refund cash (not vouchers) for cancelled flights',
      'DOT Rule: 24-hour cancellation policy for tickets booked 7+ days in advance',
      'EU EC 261/2004 applies to flights from EU airports',
    ],
    invoice: [
      'Uniform Commercial Code (UCC) governs commercial transactions',
      'Small claims court available in all states for amounts up to $2,500-$25,000',
    ],
    product: [
      'Magnuson-Moss Warranty Act: Governs written warranties on consumer products',
      'FTC Mail Order Rule: Right to refund if item arrives significantly different',
    ],
  },
}

export function getLawsForCase(state: string, category: string): string[] {
  const stateLawSet = stateLaws[state] || stateLaws['FEDERAL']
  const categoryLaws = stateLawSet[category] || []
  const federalLaws = stateLaws['FEDERAL'][category] || []
  return [...categoryLaws, ...federalLaws]
}
```

**Step 2: Create Claude client**

Create `advocate-api/src/lib/claude.ts`:

```typescript
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

export interface CaseAnalysis {
  rights: string[]
  applicable_laws: string[]
  demand_letter: string
  phone_script: {
    opening: string
    negotiation: string
    pushback: string
    escalation: string
  }
  next_steps: string[]
  estimated_recovery: string
}

export async function analyzeCase(input: CaseInput): Promise<CaseAnalysis> {
  const laws = getLawsForCase(input.state, input.category)

  const systemPrompt = `You are Advocate, an AI-powered consumer rights information tool.
You help everyday people understand their legal rights and draft professional communications.

IMPORTANT: Always include this disclaimer in your output: "This information is provided for educational purposes only and does not constitute legal advice. For complex matters, consult a licensed attorney."

You must respond with ONLY valid JSON matching this exact schema — no markdown, no extra text:
{
  "rights": ["string array of user's rights in plain English"],
  "applicable_laws": ["string array of specific law citations"],
  "demand_letter": "full professional demand letter text",
  "phone_script": {
    "opening": "exactly what to say when they answer",
    "negotiation": "how to make your case clearly",
    "pushback": "what to say when they push back or refuse",
    "escalation": "final escalation language including threat of complaint/legal action"
  },
  "next_steps": ["ordered array of escalation steps if letter fails"],
  "estimated_recovery": "realistic estimate of what they can recover"
}

Relevant laws for this case:
${laws.map(l => `- ${l}`).join('\n')}

Write demand letters in formal business style. Be direct but professional.
Phone scripts should be natural, confident, and conversational.
Always be accurate — never fabricate laws or rights.`

  const userMessage = `Please analyze this consumer dispute case:

Category: ${input.category}
State: ${input.state}
Situation: ${input.description}
${input.opponentName ? `Company/Person: ${input.opponentName}` : ''}
${input.amountDisputed ? `Amount Disputed: $${input.amountDisputed}` : ''}
${input.userName ? `User Name: ${input.userName}` : 'User Name: [YOUR NAME]'}

Generate a complete case analysis with demand letter, phone script, and next steps.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{ role: 'user', content: userMessage }],
    system: systemPrompt,
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text) as CaseAnalysis
}
```

**Step 3: Create generate route**

Create `advocate-api/src/routes/generate.ts`:

```typescript
import { Router } from 'express'
import { analyzeCase } from '../lib/claude'

const router = Router()

router.post('/analyze', async (req, res) => {
  try {
    const { category, description, state, opponentName, amountDisputed, userName } = req.body

    if (!category || !description || !state) {
      return res.status(400).json({ error: 'category, description, and state are required' })
    }

    const analysis = await analyzeCase({
      category, description, state, opponentName, amountDisputed, userName
    })

    res.json({ success: true, analysis })
  } catch (error: any) {
    console.error('Generate error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
```

**Step 4: Test the endpoint**

```bash
curl -X POST http://localhost:3001/api/generate/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "category": "deposit",
    "description": "My landlord kept my $1500 security deposit after I moved out. It has been 45 days and I received no itemized list.",
    "state": "CA",
    "opponentName": "John Smith Properties LLC",
    "amountDisputed": 1500,
    "userName": "Jane Doe"
  }'
```
Expected: JSON response with rights, demand_letter, phone_script, next_steps

**Step 5: Commit**

```bash
git add src/
git commit -m "feat: add Claude API case analysis endpoint with state-specific laws"
```

---

## Phase 4: Core App Screens

### Task 8: New Case Flow Screens

**Files:**
- Modify: `advocate/src/screens/NewCaseScreen.tsx`
- Create: `advocate/src/screens/CaseAnalysisScreen.tsx`
- Create: `advocate/src/store/caseStore.ts`
- Create: `advocate/src/api/cases.ts`

**Step 1: Create case API client**

Create `advocate/src/api/cases.ts`:

```typescript
import axios from 'axios'
import { supabase } from '../lib/supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export const analyzeCase = async (caseData: {
  category: string
  description: string
  state: string
  opponentName?: string
  amountDisputed?: number
}) => {
  const { data: { user } } = await supabase.auth.getUser()
  const response = await axios.post(`${API_URL}/api/generate/analyze`, {
    ...caseData,
    userName: user?.email?.split('@')[0] || 'User',
  })
  return response.data.analysis
}

export const saveCase = async (caseData: any) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('cases')
    .insert({ ...caseData, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export const saveDocument = async (caseId: string, type: string, content: any) => {
  const { data, error } = await supabase
    .from('documents')
    .insert({ case_id: caseId, type, content })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getUserCases = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('cases')
    .select('*, documents(*), escalation_steps(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
```

**Step 2: Build NewCaseScreen**

Replace `advocate/src/screens/NewCaseScreen.tsx`:

```typescript
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { colors } from '../theme/colors'
import { analyzeCase, saveCase, saveDocument } from '../api/cases'
import { checkProStatus } from '../lib/purchases'

const CATEGORIES = [
  { id: 'deposit', emoji: '🏠', title: 'Security Deposit' },
  { id: 'charges', emoji: '💳', title: 'Unauthorized Charges' },
  { id: 'travel', emoji: '✈️', title: 'Flight / Travel' },
  { id: 'invoice', emoji: '💼', title: 'Unpaid Invoice' },
  { id: 'product', emoji: '📦', title: 'Defective Product' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function NewCaseScreen({ navigation }: any) {
  const [step, setStep] = useState(0) // 0=category, 1=details, 2=loading
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState('CA')
  const [opponentName, setOpponentName] = useState('')
  const [amountDisputed, setAmountDisputed] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!description.trim()) return Alert.alert('Please describe your situation')

    // Check if user is on free plan and already has a case
    const isPro = await checkProStatus()
    // Free tier: show paywall after first case (handled server-side via case count check)

    setLoading(true)
    try {
      const analysis = await analyzeCase({
        category,
        description,
        state,
        opponentName: opponentName || undefined,
        amountDisputed: amountDisputed ? parseFloat(amountDisputed) : undefined,
      })

      const savedCase = await saveCase({
        category,
        description,
        state,
        opponent_name: opponentName,
        amount_disputed: amountDisputed ? parseFloat(amountDisputed) : null,
        status: 'active',
      })

      await saveDocument(savedCase.id, 'letter', { content: analysis.demand_letter })
      await saveDocument(savedCase.id, 'script', { content: analysis.phone_script })

      navigation.replace('CaseAnalysis', { analysis, caseId: savedCase.id })
    } catch (e: any) {
      Alert.alert('Error', e.message)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your case with AI...</Text>
        <Text style={styles.loadingSubtext}>Identifying your rights and drafting your letter</Text>
      </View>
    )
  }

  if (step === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>What's your dispute?</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, category === cat.id && styles.cardSelected]}
            onPress={() => { setCategory(cat.id); setStep(1) }}
          >
            <Text style={styles.cardEmoji}>{cat.emoji}</Text>
            <Text style={[styles.cardTitle, category === cat.id && styles.cardTitleSelected]}>
              {cat.title}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(0)} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tell us what happened</Text>

        <Text style={styles.label}>Describe your situation *</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. My landlord kept my $1500 deposit. I moved out 45 days ago and haven't received it back or any itemized list..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Your state *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
          {US_STATES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.stateChip, state === s && styles.stateChipSelected]}
              onPress={() => setState(s)}
            >
              <Text style={[styles.stateChipText, state === s && styles.stateChipTextSelected]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Company / Person name (optional)</Text>
        <TextInput
          style={styles.input}
          value={opponentName}
          onChangeText={setOpponentName}
          placeholder="e.g. Green Valley Apartments LLC"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Amount disputed (optional)</Text>
        <TextInput
          style={styles.input}
          value={amountDisputed}
          onChangeText={setAmountDisputed}
          placeholder="e.g. 1500"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.analyzeButton, !description.trim() && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={!description.trim()}
        >
          <Text style={styles.analyzeButtonText}>⚖️ Analyze My Case →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  center: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingTop: 60 },
  back: { marginBottom: 20 },
  backText: { color: colors.primary, fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary },
  cardEmoji: { fontSize: 24, marginRight: 14 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  cardTitleSelected: { color: colors.primary },
  arrow: { fontSize: 20, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
  textArea: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
    minHeight: 140,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  stateScroll: { marginBottom: 4 },
  stateChip: {
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: colors.border,
  },
  stateChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  stateChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  stateChipTextSelected: { color: '#FFF' },
  analyzeButton: {
    backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 28,
  },
  buttonDisabled: { opacity: 0.4 },
  analyzeButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  loadingText: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 24, textAlign: 'center' },
  loadingSubtext: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
})
```

**Step 3: Commit**

```bash
git add src/screens/NewCaseScreen.tsx src/api/cases.ts
git commit -m "feat: add new case flow with AI analysis integration"
```

---

### Task 9: Case Analysis + Demand Letter Screen

**Files:**
- Modify: `advocate/src/screens/CaseAnalysisScreen.tsx`
- Modify: `advocate/src/screens/DemandLetterScreen.tsx`

**Step 1: Build CaseAnalysisScreen**

Replace `advocate/src/screens/CaseAnalysisScreen.tsx`:

```typescript
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { colors } from '../theme/colors'

export default function CaseAnalysisScreen({ route, navigation }: any) {
  const { analysis, caseId } = route.params

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>⚖️ Your Case Analysis</Text>

      {/* Rights Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Rights</Text>
        {analysis.rights.map((right: string, i: number) => (
          <View key={i} style={styles.rightRow}>
            <Text style={styles.rightBullet}>✓</Text>
            <Text style={styles.rightText}>{right}</Text>
          </View>
        ))}
      </View>

      {/* Applicable Laws */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applicable Laws</Text>
        {analysis.applicable_laws.map((law: string, i: number) => (
          <View key={i} style={styles.lawRow}>
            <Text style={styles.lawText}>⚖️ {law}</Text>
          </View>
        ))}
      </View>

      {/* Estimated Recovery */}
      {analysis.estimated_recovery && (
        <View style={[styles.section, styles.recoverySection]}>
          <Text style={styles.recoveryLabel}>Estimated Recovery</Text>
          <Text style={styles.recoveryAmount}>{analysis.estimated_recovery}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <Text style={styles.actionsTitle}>Take Action</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('DemandLetter', { analysis, caseId })}
      >
        <Text style={styles.actionEmoji}>📝</Text>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>View Demand Letter</Text>
          <Text style={styles.actionSubtitle}>Professional letter ready to send</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('PhoneScript', { analysis, caseId })}
      >
        <Text style={styles.actionEmoji}>📞</Text>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Phone Script</Text>
          <Text style={styles.actionSubtitle}>Know exactly what to say</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => navigation.navigate('OutcomeTracker', { analysis, caseId })}
      >
        <Text style={styles.actionEmoji}>🎯</Text>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Track Your Case</Text>
          <Text style={styles.actionSubtitle}>Step-by-step escalation path</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        ℹ️ This analysis is for informational purposes only and does not constitute legal advice.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 28 },
  section: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 14, letterSpacing: 0.5 },
  rightRow: { flexDirection: 'row', marginBottom: 10 },
  rightBullet: { color: colors.success, fontWeight: '700', fontSize: 15, marginRight: 10, marginTop: 1 },
  rightText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  lawRow: {
    backgroundColor: colors.primary + '11', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  lawText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  recoverySection: { backgroundColor: colors.accent + '15', borderColor: colors.accent },
  recoveryLabel: { fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: 6 },
  recoveryAmount: { fontSize: 22, fontWeight: '800', color: colors.text },
  actionsTitle: { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginBottom: 14 },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  actionEmoji: { fontSize: 28, marginRight: 16 },
  actionText: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 3 },
  actionSubtitle: { fontSize: 13, color: colors.textSecondary },
  actionArrow: { fontSize: 22, color: colors.textSecondary },
  disclaimer: {
    fontSize: 12, color: colors.textMuted, textAlign: 'center',
    lineHeight: 18, marginTop: 8, marginBottom: 40,
  },
})
```

**Step 2: Build DemandLetterScreen with PDF export**

Replace `advocate/src/screens/DemandLetterScreen.tsx`:

```typescript
import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import Share from 'react-native-share'
import { colors } from '../theme/colors'

export default function DemandLetterScreen({ route }: any) {
  const { analysis } = route.params
  const letter: string = analysis.demand_letter
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const generateAndSharePDF = async () => {
    setGeneratingPdf(true)
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Georgia, serif; font-size: 14px; line-height: 1.8;
                     margin: 60px; color: #1a1a1a; }
              p { margin: 0 0 16px 0; }
              .disclaimer { margin-top: 40px; font-size: 11px; color: #888;
                           border-top: 1px solid #eee; padding-top: 16px; }
            </style>
          </head>
          <body>
            ${letter.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
            <div class="disclaimer">
              Generated by Advocate App. This letter is provided for informational purposes only
              and does not constitute legal advice.
            </div>
          </body>
        </html>
      `
      const pdf = await RNHTMLtoPDF.convert({
        html,
        fileName: `advocate-demand-letter-${Date.now()}`,
        directory: 'Documents',
      })

      await Share.open({
        url: `file://${pdf.filePath}`,
        type: 'application/pdf',
        title: 'Demand Letter',
      })
    } catch (e: any) {
      if (!e.message?.includes('User did not share')) {
        Alert.alert('Error', 'Could not generate PDF: ' + e.message)
      }
    }
    setGeneratingPdf(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>📝 Demand Letter</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={generateAndSharePDF}
          disabled={generatingPdf}
        >
          {generatingPdf
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.exportText}>Export PDF</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.letterContainer}>
        <View style={styles.letterPaper}>
          {letter.split('\n').map((line, i) => (
            <Text key={i} style={line ? styles.letterLine : styles.letterSpacer}>
              {line || ' '}
            </Text>
          ))}
          <Text style={styles.letterDisclaimer}>
            {'\n'}---{'\n'}
            This letter was prepared using publicly available legal information by Advocate App.
            It does not constitute legal advice. For complex matters, consult a licensed attorney.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>📮 Sending Tips</Text>
        <Text style={styles.tipText}>• Send via certified mail for legal proof of delivery</Text>
        <Text style={styles.tipText}>• Keep a copy for your records</Text>
        <Text style={styles.tipText}>• Follow up in 7-14 days if no response</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  toolbarTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  exportButton: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  exportText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  letterContainer: { flex: 1 },
  letterPaper: {
    margin: 16, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 28, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  letterLine: { fontSize: 14, color: '#1a1a1a', lineHeight: 24, marginBottom: 2 },
  letterSpacer: { fontSize: 14, color: '#1a1a1a', lineHeight: 16 },
  letterDisclaimer: { fontSize: 11, color: '#888', lineHeight: 16, marginTop: 8 },
  tips: {
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    padding: 20,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  tipText: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, lineHeight: 20 },
})
```

**Step 3: Commit**

```bash
git add src/screens/CaseAnalysisScreen.tsx src/screens/DemandLetterScreen.tsx
git commit -m "feat: add case analysis and demand letter screens with PDF export"
```

---

### Task 10: Phone Script Screen

**Files:**
- Modify: `advocate/src/screens/PhoneScriptScreen.tsx`

Replace `advocate/src/screens/PhoneScriptScreen.tsx`:

```typescript
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { colors } from '../theme/colors'

const STAGES = [
  { key: 'opening', label: 'Opening', emoji: '👋', color: colors.primary },
  { key: 'negotiation', label: 'Your Case', emoji: '⚖️', color: colors.accent },
  { key: 'pushback', label: 'Pushback', emoji: '🛡️', color: colors.warning },
  { key: 'escalation', label: 'Escalation', emoji: '⚡', color: colors.danger },
]

export default function PhoneScriptScreen({ route }: any) {
  const { analysis } = route.params
  const script = analysis.phone_script
  const [activeStage, setActiveStage] = useState('opening')

  const active = STAGES.find(s => s.key === activeStage)!

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📞 Phone Script</Text>
      <Text style={styles.subtitle}>Read this word-for-word when you call</Text>

      <View style={styles.tip}>
        <Text style={styles.tipText}>
          💡 You can say: <Text style={styles.tipBold}>"I am recording this call for quality purposes."</Text>
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
        {STAGES.map((stage) => (
          <TouchableOpacity
            key={stage.key}
            style={[styles.stageTab, activeStage === stage.key && { borderColor: stage.color, backgroundColor: stage.color + '22' }]}
            onPress={() => setActiveStage(stage.key)}
          >
            <Text style={styles.stageEmoji}>{stage.emoji}</Text>
            <Text style={[styles.stageLabel, activeStage === stage.key && { color: stage.color }]}>
              {stage.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scriptContainer}>
        <View style={[styles.scriptCard, { borderLeftColor: active.color }]}>
          <Text style={[styles.scriptStageLabel, { color: active.color }]}>
            {active.emoji} {active.label}
          </Text>
          <Text style={styles.scriptText}>
            {script[activeStage as keyof typeof script]}
          </Text>
        </View>

        {activeStage === 'escalation' && (
          <View style={styles.escalationNote}>
            <Text style={styles.escalationTitle}>After the call, escalate to:</Text>
            {analysis.next_steps.map((step: string, i: number) => (
              <Text key={i} style={styles.escalationStep}>
                {i + 1}. {step}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  tip: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: colors.border,
  },
  tipText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  tipBold: { fontWeight: '700', color: colors.text },
  stageScroll: { marginBottom: 20, flexGrow: 0 },
  stageTab: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 10, marginRight: 10, borderWidth: 1.5, borderColor: colors.border,
  },
  stageEmoji: { fontSize: 16, marginRight: 6 },
  stageLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  scriptContainer: { flex: 1 },
  scriptCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    borderLeftWidth: 4, marginBottom: 16,
  },
  scriptStageLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 14 },
  scriptText: { fontSize: 16, color: colors.text, lineHeight: 28 },
  escalationNote: {
    backgroundColor: colors.danger + '15', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.danger + '40',
  },
  escalationTitle: { fontSize: 14, fontWeight: '700', color: colors.danger, marginBottom: 12 },
  escalationStep: { fontSize: 14, color: colors.text, lineHeight: 24, marginBottom: 6 },
})
```

**Commit:**
```bash
git add src/screens/PhoneScriptScreen.tsx
git commit -m "feat: add phone script screen with stage-by-stage navigation"
```

---

### Task 11: Outcome Tracker Screen

**Files:**
- Modify: `advocate/src/screens/OutcomeTrackerScreen.tsx`

Replace `advocate/src/screens/OutcomeTrackerScreen.tsx`:

```typescript
import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { colors } from '../theme/colors'
import { supabase } from '../lib/supabase'

const ESCALATION_STEPS = [
  {
    step: 1, title: 'Send Demand Letter', emoji: '📮',
    desc: 'Send via certified mail. Keep tracking number. Allow 14 days for response.',
    action: 'Mark Letter Sent',
  },
  {
    step: 2, title: 'Chargeback / Bank Dispute', emoji: '💳',
    desc: 'Contact your bank or credit card company. File a chargeback or dispute. Reference your demand letter.',
    action: 'Mark Dispute Filed',
  },
  {
    step: 3, title: 'Official Complaint', emoji: '🏛️',
    desc: 'File with CFPB (consumerfinance.gov), your State AG, or BBB. This creates a paper trail and often prompts resolution.',
    action: 'Mark Complaint Filed',
  },
  {
    step: 4, title: 'Small Claims Court', emoji: '⚖️',
    desc: 'File in small claims court. No lawyer needed for amounts under $5,000-$25,000 (varies by state). They often settle before court date.',
    action: 'Mark Filed',
  },
]

export default function OutcomeTrackerScreen({ route }: any) {
  const { caseId } = route.params
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const markStepComplete = async (stepNum: number) => {
    if (completedSteps.includes(stepNum)) return

    await supabase.from('escalation_steps').upsert({
      case_id: caseId,
      step_number: stepNum,
      action_type: ESCALATION_STEPS[stepNum - 1].title,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    setCompletedSteps(prev => [...prev, stepNum])
  }

  const handleWon = async () => {
    Alert.alert(
      '🎉 You Won!',
      'How much did you recover?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Won', onPress: async () => {
            await supabase.from('cases').update({
              status: 'resolved', outcome: 'won', resolved_at: new Date().toISOString()
            }).eq('id', caseId)
            Alert.alert('Congratulations!', 'Your win has been recorded. Share your story to help others!')
          }
        }
      ]
    )
  }

  const currentStep = Math.min(completedSteps.length + 1, 4)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🎯 Case Tracker</Text>
      <Text style={styles.subtitle}>Follow these steps in order until resolved</Text>

      {ESCALATION_STEPS.map((step) => {
        const isCompleted = completedSteps.includes(step.step)
        const isActive = step.step === currentStep
        const isLocked = step.step > currentStep

        return (
          <View key={step.step} style={[
            styles.stepCard,
            isCompleted && styles.stepCompleted,
            isActive && styles.stepActive,
            isLocked && styles.stepLocked,
          ]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepBadge, isCompleted && styles.stepBadgeCompleted]}>
                <Text style={styles.stepBadgeText}>
                  {isCompleted ? '✓' : step.step}
                </Text>
              </View>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={[styles.stepTitle, isLocked && styles.stepTitleLocked]}>
                {step.title}
              </Text>
            </View>
            <Text style={[styles.stepDesc, isLocked && styles.stepDescLocked]}>
              {step.desc}
            </Text>
            {isActive && !isCompleted && (
              <TouchableOpacity
                style={styles.stepAction}
                onPress={() => markStepComplete(step.step)}
              >
                <Text style={styles.stepActionText}>{step.action}</Text>
              </TouchableOpacity>
            )}
            {isCompleted && (
              <Text style={styles.stepDoneLabel}>✓ Completed</Text>
            )}
          </View>
        )
      })}

      <TouchableOpacity style={styles.wonButton} onPress={handleWon}>
        <Text style={styles.wonButtonText}>🎉 I Won My Case!</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Most cases resolve at Step 1 or 2. Companies take official complaints (Step 3) very seriously.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  stepCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    marginBottom: 14, borderWidth: 1.5, borderColor: colors.border,
  },
  stepCompleted: { borderColor: colors.success, backgroundColor: colors.success + '10' },
  stepActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  stepLocked: { opacity: 0.5 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  stepBadgeCompleted: { backgroundColor: colors.success },
  stepBadgeText: { fontSize: 13, fontWeight: '700', color: colors.text },
  stepEmoji: { fontSize: 20, marginRight: 10 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  stepTitleLocked: { color: colors.textSecondary },
  stepDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  stepDescLocked: { color: colors.textMuted },
  stepAction: {
    backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginTop: 14,
  },
  stepActionText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  stepDoneLabel: { color: colors.success, fontSize: 13, fontWeight: '600', marginTop: 10 },
  wonButton: {
    backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  wonButtonText: { color: colors.background, fontSize: 17, fontWeight: '800' },
  note: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 40 },
})
```

**Commit:**
```bash
git add src/screens/OutcomeTrackerScreen.tsx
git commit -m "feat: add outcome tracker with 4-step escalation path"
```

---

## Phase 5: Dashboard + Supporting Screens

### Task 12: Home Screen Dashboard

**Files:**
- Modify: `advocate/src/screens/HomeScreen.tsx`

Replace `advocate/src/screens/HomeScreen.tsx`:

```typescript
import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { colors } from '../theme/colors'
import { getUserCases } from '../api/cases'
import { useAuthStore } from '../store/authStore'

const CATEGORY_LABELS: Record<string, string> = {
  deposit: '🏠 Security Deposit',
  charges: '💳 Unauthorized Charges',
  travel: '✈️ Flight / Travel',
  invoice: '💼 Unpaid Invoice',
  product: '📦 Defective Product',
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore()
  const [cases, setCases] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadCases = async () => {
    const data = await getUserCases()
    setCases(data || [])
  }

  useFocusEffect(useCallback(() => { loadCases() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const activeCases = cases.filter(c => c.status === 'active')
  const wonCases = cases.filter(c => c.outcome === 'won')
  const totalRecovered = cases
    .filter(c => c.outcome === 'won' && c.amount_disputed)
    .reduce((sum, c) => sum + (c.amount_disputed || 0), 0)

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>⚖️ Advocate</Text>
          <Text style={styles.subtitle}>Know your rights. Fight back. Win.</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeCases.length}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
        </View>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={[styles.statNumber, styles.statNumberAccent]}>
            ${totalRecovered.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Recovered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{wonCases.length}</Text>
          <Text style={styles.statLabel}>Cases Won</Text>
        </View>
      </View>

      {/* New Case CTA */}
      <TouchableOpacity
        style={styles.newCaseButton}
        onPress={() => navigation.navigate('NewCase')}
      >
        <Text style={styles.newCaseEmoji}>⚡</Text>
        <View style={styles.newCaseText}>
          <Text style={styles.newCaseTitle}>Start New Case</Text>
          <Text style={styles.newCaseSubtitle}>Get your demand letter in 60 seconds</Text>
        </View>
        <Text style={styles.newCaseArrow}>›</Text>
      </TouchableOpacity>

      {/* Active Cases */}
      {activeCases.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Active Cases</Text>
          {activeCases.slice(0, 3).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.caseCard}
              onPress={() => navigation.navigate('OutcomeTracker', { caseId: c.id, analysis: null })}
            >
              <Text style={styles.caseCategoryLabel}>
                {CATEGORY_LABELS[c.category] || c.category}
              </Text>
              {c.amount_disputed && (
                <Text style={styles.caseAmount}>${c.amount_disputed.toLocaleString()}</Text>
              )}
              <Text style={styles.caseDate} numberOfLines={2}>{c.description}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Empty state */}
      {cases.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>⚖️</Text>
          <Text style={styles.emptyTitle}>No cases yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first case above. Most disputes resolve within 2 weeks.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statCardAccent: { borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statNumberAccent: { color: colors.accent },
  statLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  newCaseButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    borderRadius: 18, padding: 20, marginBottom: 32,
  },
  newCaseEmoji: { fontSize: 28, marginRight: 16 },
  newCaseText: { flex: 1 },
  newCaseTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 3 },
  newCaseSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  newCaseArrow: { fontSize: 24, color: '#FFF' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 14, letterSpacing: 0.5 },
  caseCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  caseCategoryLabel: { fontSize: 14, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  caseAmount: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 6 },
  caseDate: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
```

**Commit:**
```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: add home dashboard with stats and active case list"
```

---

### Task 13: My Cases + Settings Screens

**Files:**
- Modify: `advocate/src/screens/MyCasesScreen.tsx`
- Modify: `advocate/src/screens/SettingsScreen.tsx`

**MyCasesScreen:**

```typescript
import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { colors } from '../theme/colors'
import { getUserCases } from '../api/cases'

const STATUS_COLORS: Record<string, string> = {
  active: colors.primary,
  resolved: colors.success,
  escalated: colors.warning,
}

const FILTERS = ['All', 'Active', 'Won', 'Escalated']

export default function MyCasesScreen({ navigation }: any) {
  const [cases, setCases] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const loadCases = async () => {
    const data = await getUserCases()
    setCases(data || [])
  }

  useFocusEffect(useCallback(() => { loadCases() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const filtered = cases.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Active') return c.status === 'active'
    if (filter === 'Won') return c.outcome === 'won'
    if (filter === 'Escalated') return c.status === 'escalated'
    return true
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cases</Text>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filter, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OutcomeTracker', { caseId: item.id, analysis: null })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardCategory}>{item.category}</Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || colors.border) + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || colors.textSecondary }]}>
                  {item.outcome === 'won' ? '🏆 Won' : item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            {item.amount_disputed && (
              <Text style={styles.cardAmount}>${item.amount_disputed.toLocaleString()} disputed</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cases found</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingHorizontal: 24, marginBottom: 20 },
  filters: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
  filter: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#FFF' },
  list: { paddingHorizontal: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardCategory: { fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'capitalize' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  cardAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: colors.textSecondary, fontSize: 16 },
})
```

**SettingsScreen:**

```typescript
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { colors } from '../theme/colors'
import { useAuthStore } from '../store/authStore'
import { checkProStatus, restorePurchases } from '../lib/purchases'

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore()
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    checkProStatus().then(setIsPro)
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  const handleRestore = async () => {
    const restored = await restorePurchases()
    setIsPro(restored)
    Alert.alert(restored ? 'Pro Restored!' : 'No purchases found', '')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user?.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Plan</Text>
          <View style={[styles.planBadge, isPro && styles.planBadgePro]}>
            <Text style={[styles.planText, isPro && styles.planTextPro]}>
              {isPro ? '⚡ Pro' : 'Free'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Subscription</Text>
        <TouchableOpacity style={styles.button} onPress={handleRestore}>
          <Text style={styles.buttonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Legal</Text>
        <Text style={styles.legalText}>
          Advocate provides legal information only, not legal advice.
          All AI-generated content is for educational purposes.
          For complex legal matters, consult a licensed attorney.
        </Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 32 },
  section: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 16, letterSpacing: 0.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowLabel: { fontSize: 15, color: colors.textSecondary },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
  planBadge: { backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  planBadgePro: { backgroundColor: colors.primary + '22' },
  planText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  planTextPro: { color: colors.primary },
  button: {
    backgroundColor: colors.primary + '22', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.primary,
  },
  buttonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  legalText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  signOutButton: {
    backgroundColor: colors.danger + '22', borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1, borderColor: colors.danger,
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
})
```

**Commit:**
```bash
git add src/screens/MyCasesScreen.tsx src/screens/SettingsScreen.tsx
git commit -m "feat: add my cases and settings screens"
```

---

## Phase 6: Deploy + Launch

### Task 14: Deploy Backend to Railway

**Step 1: Create Railway account**
- Go to https://railway.app → New Project → Deploy from GitHub
- Connect your `advocate-api` repo
- Railway auto-detects Node.js

**Step 2: Add environment variables in Railway dashboard**
```
ANTHROPIC_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=3001
```

**Step 3: Update mobile app API URL**

In `advocate/.env`:
```
EXPO_PUBLIC_API_URL=https://your-railway-app.railway.app
```

**Step 4: Verify health endpoint**

```bash
curl https://your-railway-app.railway.app/health
```
Expected: `{"status":"ok"}`

**Commit:**
```bash
git add .env.example
git commit -m "chore: add Railway deployment config"
```

---

### Task 15: Mixpanel Analytics

**Files:**
- Create: `advocate/src/lib/analytics.ts`

Create `advocate/src/lib/analytics.ts`:

```typescript
import { Mixpanel } from 'mixpanel-react-native'

const mixpanel = new Mixpanel(process.env.EXPO_PUBLIC_MIXPANEL_TOKEN!, true)
mixpanel.init()

export const track = (event: string, properties?: Record<string, any>) => {
  mixpanel.track(event, properties)
}

export const identify = (userId: string) => {
  mixpanel.identify(userId)
}

// Key events to track:
// track('onboarding_started')
// track('onboarding_completed', { category: 'deposit' })
// track('paywall_viewed')
// track('subscription_started', { plan: 'annual' })
// track('case_created', { category: 'deposit' })
// track('letter_generated')
// track('pdf_exported')
// track('case_won', { amount: 1500 })
```

Add `EXPO_PUBLIC_MIXPANEL_TOKEN=your_token` to `.env`

**Commit:**
```bash
git add src/lib/analytics.ts
git commit -m "feat: add Mixpanel analytics"
```

---

### Task 16: Build + Submit to Google Play

**Step 1: Configure app.json for production**

Update `advocate/app.json`:
```json
{
  "expo": {
    "name": "Advocate",
    "slug": "advocate-app",
    "version": "1.0.0",
    "android": {
      "package": "com.advocate.app",
      "versionCode": 1,
      "permissions": ["INTERNET", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    }
  }
}
```

**Step 2: Install EAS CLI and build**

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

**Step 3: Submit to Google Play**

```bash
eas submit --platform android
```

Or manually upload the `.aab` file to Google Play Console:
- Go to https://play.google.com/console
- Create new app → "Advocate"
- Upload AAB → Fill store listing → Submit for review

---

## Checklist Before Submission

- [ ] Test onboarding flow on real Android device
- [ ] Test paywall — purchase and restore working
- [ ] Test case creation → AI analysis → letter → PDF
- [ ] Test phone script navigation
- [ ] Test outcome tracker step completion
- [ ] Legal disclaimer visible in letter and app
- [ ] Privacy policy page linked in Play Store listing
- [ ] App icon and screenshots ready (use Figma)
- [ ] Category: Finance or Tools
- [ ] Age rating: Everyone

---

## Revenue Targets

| Month | Downloads | Subscribers | MRR |
|---|---|---|---|
| 1 | 500 | 30 | $300 |
| 2 | 2,000 | 150 | $1,500 |
| 3 | 5,000 | 400 | $4,000 |
| 6 | 15,000 | 1,200 | $12,000 |
| 12 | 40,000 | 3,500 | $35,000 |

**Growth engine:** TikTok videos of real case wins → zero ad spend needed until Month 3+
