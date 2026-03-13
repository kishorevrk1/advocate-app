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
      <LinearGradient colors={['#0F1E3A', colors.background]} style={styles.topGradient} start={{x:0.5,y:0}} end={{x:0.5,y:1}} />
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
              <GlassCard style={styles.recoveryCard} glow={colors.goldPrimary}>
                <LinearGradient colors={[colors.accentDim, 'rgba(201,168,76,0)']} style={styles.recoveryGradient}>
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
  backText: { color: colors.goldPrimary, fontSize: 15, fontWeight: '600' },
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
  recoveryAmount: { fontSize: 32, fontWeight: '900', color: colors.goldBright, marginBottom: 4 },
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
