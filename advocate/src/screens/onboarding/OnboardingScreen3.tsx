import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
