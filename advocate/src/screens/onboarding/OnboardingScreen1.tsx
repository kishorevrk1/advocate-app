import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
