import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'
import { analyzeCase, saveCase, saveDocument } from '../api/cases'

const CATEGORIES = [
  { id: 'deposit', emoji: '🏠', title: 'Security Deposit', subtitle: 'Landlord keeping your money' },
  { id: 'charges', emoji: '💳', title: 'Unauthorized Charges', subtitle: 'Subscription or billing fraud' },
  { id: 'travel', emoji: '✈️', title: 'Flight / Travel', subtitle: 'Cancelled or delayed flights' },
  { id: 'invoice', emoji: '💼', title: 'Unpaid Invoice', subtitle: 'Client not paying what\'s owed' },
  { id: 'product', emoji: '📦', title: 'Defective Product', subtitle: 'Return denied or product broken' },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function NewCaseScreen({ navigation }: any) {
  const [step, setStep] = useState(0) // 0=category, 1=details
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState('CA')
  const [opponentName, setOpponentName] = useState('')
  const [amountDisputed, setAmountDisputed] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe your situation')
      return
    }
    if (description.trim().length < 20) {
      Alert.alert('More detail needed', 'Please describe your situation in at least 20 characters')
      return
    }

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
        opponent_name: opponentName || null,
        amount_disputed: amountDisputed ? parseFloat(amountDisputed) : null,
        status: 'active',
      })

      await saveDocument(savedCase.id, 'letter', { content: analysis.demand_letter })
      await saveDocument(savedCase.id, 'script', { content: analysis.phone_script })

      navigation.replace('CaseAnalysis', { analysis, caseId: savedCase.id })
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || e.message || 'Something went wrong')
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
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>What's your dispute?</Text>
        <Text style={styles.subtitle}>Select the closest match — we'll tailor everything to your case.</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, category === cat.id && styles.cardSelected]}
            onPress={() => { setCategory(cat.id); setStep(1) }}
          >
            <Text style={styles.cardEmoji}>{cat.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, category === cat.id && styles.cardTitleSelected]}>
                {cat.title}
              </Text>
              <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => setStep(0)} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tell us what happened</Text>

        <Text style={styles.label}>Describe your situation *</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder={
            category === 'deposit'
              ? "e.g. My landlord kept my $1500 deposit. I moved out 45 days ago and haven't received it back or any itemized list..."
              : category === 'charges'
              ? "e.g. I was charged $99 for a subscription I never signed up for. The charge appeared on my credit card on March 5th..."
              : "Describe what happened, when it happened, and what you're owed..."
          }
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

        <Text style={styles.label}>Amount disputed in $ (optional)</Text>
        <TextInput
          style={styles.input}
          value={amountDisputed}
          onChangeText={setAmountDisputed}
          placeholder="e.g. 1500"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ️ This tool provides legal information, not legal advice. For complex matters, consult a licensed attorney.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.analyzeWrapper, !description.trim() && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={!description.trim() || loading}
        >
          <LinearGradient
            colors={colors.gradientGold as [string, string, string]}
            style={styles.analyzeButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.analyzeButtonText}>⚖️ Analyze My Case →</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgScreen },
  center: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 20 },
  backText: { color: colors.primary, fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24, lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1.5, borderColor: colors.border,
  },
  cardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  cardEmoji: { fontSize: 24, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 3 },
  cardTitleSelected: { color: colors.primary },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary },
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
  disclaimer: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    marginTop: 20, borderWidth: 1, borderColor: colors.border,
  },
  disclaimerText: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  analyzeWrapper: { borderRadius: 18, overflow: 'hidden', marginTop: 20 },
  analyzeButton: { paddingVertical: 18, alignItems: 'center' },
  analyzeButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  buttonDisabled: { opacity: 0.4 },
  loadingText: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 24, textAlign: 'center' },
  loadingSubtext: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
})
