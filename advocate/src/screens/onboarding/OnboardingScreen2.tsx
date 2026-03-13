import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
