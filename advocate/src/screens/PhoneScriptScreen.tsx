import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'

const STAGES = [
  { key: 'opening', label: 'Opening', emoji: '👋', color: colors.primary },
  { key: 'negotiation', label: 'Your Case', emoji: '⚖️', color: colors.accent },
  { key: 'pushback', label: 'Pushback', emoji: '🛡️', color: colors.warning },
  { key: 'escalation', label: 'Escalation', emoji: '⚡', color: colors.danger },
]

export default function PhoneScriptScreen({ route, navigation }: any) {
  const { analysis } = route.params
  const script = analysis.phone_script
  const [activeStage, setActiveStage] = useState('opening')

  const active = STAGES.find(s => s.key === activeStage)!

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.inner}>
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
              style={[
                styles.stageTab,
                activeStage === stage.key && { borderColor: stage.color },
              ]}
              onPress={() => setActiveStage(stage.key)}
            >
              {activeStage === stage.key ? (
                <LinearGradient
                  colors={[stage.color + 'AA', stage.color + '44']}
                  style={styles.stageTabActive}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.stageEmoji}>{stage.emoji}</Text>
                  <Text style={[styles.stageLabel, { color: stage.color }]}>{stage.label}</Text>
                </LinearGradient>
              ) : (
                <>
                  <Text style={styles.stageEmoji}>{stage.emoji}</Text>
                  <Text style={styles.stageLabel}>{stage.label}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.scriptContainer}>
          <View style={[styles.scriptCard, { borderLeftColor: active.color }]}>
            <Text style={[styles.scriptStageLabel, { color: active.color }]}>
              {active.emoji} {active.label.toUpperCase()}
            </Text>
            <Text style={styles.scriptText}>
              {script[activeStage as keyof typeof script]}
            </Text>
          </View>

          {activeStage === 'escalation' && analysis.next_steps?.length > 0 && (
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  headerRow: { paddingHorizontal: 20, paddingVertical: 14 },
  backText: { color: colors.primary, fontSize: 15 },
  inner: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  tip: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  tipText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  tipBold: { fontWeight: '700', color: colors.text },
  stageScroll: { marginBottom: 20, flexGrow: 0 },
  stageTab: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12,
    marginRight: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  stageTabActive: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignItems: 'center', flexDirection: 'row' },
  stageEmoji: { fontSize: 16, marginRight: 6, paddingHorizontal: 12, paddingVertical: 10 },
  stageLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, paddingRight: 12 },
  scriptContainer: { flex: 1 },
  scriptCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20,
    borderLeftWidth: 4, marginBottom: 16,
  },
  scriptStageLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  scriptText: { fontSize: 16, color: colors.text, lineHeight: 28 },
  escalationNote: {
    backgroundColor: colors.danger + '15', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: colors.danger + '40',
  },
  escalationTitle: { fontSize: 14, fontWeight: '700', color: colors.danger, marginBottom: 12 },
  escalationStep: { fontSize: 14, color: colors.text, lineHeight: 24, marginBottom: 6 },
})
