import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme/colors'
import { ShieldLogo } from '../components/ui'
import { sendChatMessage, ChatMessage } from '../api/advisor'
import { getCountry, COUNTRY_FLAGS, COUNTRY_NAMES, Country } from '../lib/country'
import { parseApiError } from '../lib/apiError'

const TEMPLATE_CHIPS = [
  { id: 'letter',   label: '📝 Demand Letter',  message: 'I need help drafting a demand letter for my dispute.' },
  { id: 'phone',    label: '📞 Phone Script',    message: 'I need a phone script to call and resolve my dispute.' },
  { id: 'consumer', label: '📬 Consumer Forum',  message: 'I want to file a Consumer Forum complaint. Can you guide me?' },
  { id: 'bank',     label: '🏦 Bank Ombudsman',  message: 'I want to file a Banking Ombudsman complaint for my issue.' },
  { id: 'rera',     label: '🏠 RERA Complaint',  message: 'I want to file a RERA complaint against my builder.' },
  { id: 'rti',      label: '📋 RTI Application', message: 'I want to file an RTI application. How do I do it?' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  citations?: string[]
  document?: { type: string; title: string; content: string }
  nextSteps?: string[]
}

function greeting(country: Country): string {
  if (country === 'IN') {
    return 'Hi! I\'m your legal advisor.\n\nTell me what happened — I\'ll explain your rights and get your documents ready.\n\nI can help with consumer disputes, bank/UPI fraud, RERA complaints, RTI, telecom issues, insurance claims, and more.'
  }
  return 'Hi! I\'m your legal advisor.\n\nTell me what happened — I\'ll identify your rights and draft your demand letter or complaint in minutes.\n\nI can help with security deposits, unauthorized charges, flight cancellations, unpaid invoices, defective products, and more.'
}

export default function AdvisorScreen() {
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [country, setCountryState]    = useState<Country>('US')
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    getCountry().then(c => {
      setCountryState(c)
      setMessages([{ id: 'greeting', role: 'assistant', text: greeting(c) }])
    })
  }, [])

  const apiHistory = (): ChatMessage[] =>
    messages
      .filter(m => m.id !== 'greeting')
      .map(m => ({ role: m.role, content: m.text }))

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChatMessage(trimmed, country, apiHistory())
      const aiMsg: Message = {
        id:        `a_${Date.now()}`,
        role:      'assistant',
        text:      res.reply,
        citations: res.citations,
        document:  res.document ?? undefined,
        nextSteps: res.nextSteps ?? undefined,
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id:   `err_${Date.now()}`,
        role: 'assistant',
        text: parseApiError(e),
      }])
    }

    setLoading(false)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150)
  }

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user'
    return (
      <Animated.View
        key={msg.id}
        entering={isUser ? FadeInRight.duration(250) : FadeInLeft.duration(250)}
        style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <ShieldLogo size={22} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {msg.text}
          </Text>

          {msg.citations && msg.citations.length > 0 && (
            <View style={styles.citationsBlock}>
              <Text style={styles.citationsTitle}>⚖️ Legal basis</Text>
              {msg.citations.map((c, i) => (
                <Text key={i} style={styles.citationText}>• {c}</Text>
              ))}
            </View>
          )}

          {msg.document && (
            <View style={styles.docCard}>
              <View style={styles.docIconBox}>
                <Text style={styles.docEmoji}>
                  {msg.document.type === 'letter' ? '📝' :
                   msg.document.type === 'script' ? '📞' :
                   msg.document.type === 'rti'    ? '📋' : '📬'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docTitle}>{msg.document.title}</Text>
                <Text style={styles.docSub}>Document ready · Tap to view</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.goldPrimary} />
            </View>
          )}

          {msg.nextSteps && msg.nextSteps.length > 0 && (
            <View style={styles.stepsBlock}>
              <Text style={styles.stepsTitle}>Next steps</Text>
              {msg.nextSteps.map((s, i) => (
                <Text key={i} style={styles.stepText}>{i + 1}. {s}</Text>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F1E3A', colors.bgScreen]}
        style={styles.topGrad}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <ShieldLogo size={28} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Legal Advisor</Text>
            <Text style={styles.headerSub}>
              {COUNTRY_FLAGS[country]} {COUNTRY_NAMES[country]} · AI-powered
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(renderMessage)}

            {loading && (
              <Animated.View entering={FadeInLeft.duration(250)} style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.avatar}><ShieldLogo size={22} /></View>
                <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={colors.goldPrimary} />
                  <Text style={styles.typingText}>Analyzing...</Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Template chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chips}
            contentContainerStyle={styles.chipsContent}
          >
            {TEMPLATE_CHIPS.map(chip => (
              <TouchableOpacity
                key={chip.id}
                style={styles.chip}
                onPress={() => send(chip.message)}
                disabled={loading}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ask any legal question..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={() => send(input)}
              disabled={!input.trim() || loading}
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            >
              <LinearGradient
                colors={colors.gradientGold as [string, string, string]}
                style={styles.sendGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Ionicons name="send" size={18} color={colors.bgScreen} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.bgScreen },
  flex:            { flex: 1 },
  topGrad:         { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  safe:            { flex: 1 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  headerText:      { flex: 1 },
  headerTitle:     { fontSize: 17, fontWeight: '700', color: colors.goldBright },
  headerSub:       { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  liveBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 4 },
  liveText:        { fontSize: 10, fontWeight: '700', color: colors.success, letterSpacing: 0.5 },
  messages:        { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 },
  msgRow:          { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser:      { justifyContent: 'flex-end' },
  msgRowAI:        { justifyContent: 'flex-start' },
  avatar:          { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  bubble:          { maxWidth: '78%', borderRadius: 18, padding: 14 },
  bubbleUser:      { backgroundColor: 'rgba(201,168,76,0.18)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.30)', borderBottomRightRadius: 4 },
  bubbleAI:        { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText:      { fontSize: 15, color: colors.text, lineHeight: 22 },
  bubbleTextUser:  { color: colors.goldBright },
  citationsBlock:  { marginTop: 12, backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 10, padding: 10, borderLeftWidth: 2, borderLeftColor: colors.goldPrimary },
  citationsTitle:  { fontSize: 11, fontWeight: '700', color: colors.goldPrimary, marginBottom: 6, letterSpacing: 0.5 },
  citationText:    { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 2 },
  docCard:         { marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.borderBright },
  docIconBox:      { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  docEmoji:        { fontSize: 18 },
  docTitle:        { fontSize: 13, fontWeight: '600', color: colors.text },
  docSub:          { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  stepsBlock:      { marginTop: 12, backgroundColor: colors.bgElevated, borderRadius: 10, padding: 10 },
  stepsTitle:      { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  stepText:        { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 2 },
  typingBubble:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText:      { fontSize: 13, color: colors.textMuted },
  chips:           { maxHeight: 50, borderTopWidth: 1, borderTopColor: colors.border },
  chipsContent:    { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip:            { backgroundColor: colors.bgElevated, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  chipText:        { fontSize: 12, color: colors.text, fontWeight: '500' },
  inputBar:        { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgBase, gap: 8 },
  input:           { flex: 1, backgroundColor: colors.bgCard, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.text, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
  sendBtn:         { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendGradient:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
