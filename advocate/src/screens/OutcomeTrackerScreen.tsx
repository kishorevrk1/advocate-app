import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'
import { supabase } from '../lib/supabase'

const ESCALATION_STEPS = [
  {
    step: 1, title: 'Send Demand Letter', emoji: '📮',
    desc: 'Send via certified mail. Keep the tracking number. Allow 14 days for response.',
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
    desc: 'File in small claims court. No lawyer needed for amounts under $5,000–$25,000 (varies by state). They often settle before the court date.',
    action: 'Mark Filed',
  },
]

export default function OutcomeTrackerScreen({ route, navigation }: any) {
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
      '🎉 Congratulations!',
      'Mark this case as won?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Won',
          onPress: async () => {
            await supabase.from('cases').update({
              status: 'resolved', outcome: 'won', resolved_at: new Date().toISOString()
            }).eq('id', caseId)
            Alert.alert('You Won!', 'Your win has been recorded. Share your story to help others!')
            navigation.navigate('Home')
          }
        }
      ]
    )
  }

  const handleStepAction = (step: typeof ESCALATION_STEPS[0]) => {
    markStepComplete(step.step)
  }

  const currentStep = Math.min(completedSteps.length + 1, 4)

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
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
                  onPress={() => handleStepAction(step)}
                  activeOpacity={0.9}
                  style={styles.stepActionWrapper}
                >
                  <LinearGradient
                    colors={colors.gradientGold as [string, string, string]}
                    style={styles.stepActionBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.stepActionText}>{step.action}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {isCompleted && (
                <Text style={styles.stepDoneLabel}>✓ Completed</Text>
              )}
            </View>
          )
        })}

        <TouchableOpacity onPress={handleWon} activeOpacity={0.9} style={styles.wonWrapper}>
          <LinearGradient
            colors={colors.gradientGold as [string, string, string]}
            style={styles.wonButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.wonButtonText}>🎉 I Won My Case!</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.note}>
          Most cases resolve at Step 1 or 2. Companies take official complaints (Step 3) very seriously.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  headerRow: { paddingHorizontal: 20, paddingVertical: 14 },
  backText: { color: colors.primary, fontSize: 15 },
  content: { padding: 24, paddingBottom: 40 },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 24 },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20,
    marginBottom: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.10)',
  },
  stepCompleted: { borderColor: colors.success, backgroundColor: colors.success + '10' },
  stepActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  stepLocked: { opacity: 0.5 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  stepBadgeCompleted: { backgroundColor: colors.success },
  stepBadgeText: { fontSize: 13, fontWeight: '700', color: colors.text },
  stepEmoji: { fontSize: 20, marginRight: 10 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  stepTitleLocked: { color: 'rgba(255,255,255,0.55)' },
  stepDesc: { fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 22 },
  stepDescLocked: { color: colors.textMuted },
  stepActionWrapper: { borderRadius: 14, overflow: 'hidden', marginTop: 12 },
  stepActionBtn: { paddingVertical: 14, alignItems: 'center' },
  stepActionText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  stepDoneLabel: { color: colors.success, fontSize: 13, fontWeight: '600', marginTop: 10 },
  wonWrapper: { borderRadius: 18, overflow: 'hidden', marginTop: 8, marginBottom: 16 },
  wonButton: { paddingVertical: 20, alignItems: 'center' },
  wonButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  note: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
})
