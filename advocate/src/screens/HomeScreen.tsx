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
import { getCountry, COUNTRY_FLAGS, Country } from '../lib/country'

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
  const [country, setCountry] = useState<Country>('US')

  const load = async () => {
    try { setCases(await getUserCases() || []) } catch (e) { console.error('Failed to load cases', e) }
  }

  useFocusEffect(useCallback(() => {
    load()
    getCountry().then(setCountry)
  }, []))

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
                <View style={styles.appNameRow}>
                  <Text style={styles.appName}>Advocate</Text>
                  <View style={styles.countryChip}>
                    <Text style={styles.countryChipText}>{COUNTRY_FLAGS[country]}</Text>
                  </View>
                </View>
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

          {/* Template quick-access */}
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.templateRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateChips}>
              {[
                { label: '📝 Demand Letter' },
                { label: '📬 Consumer Forum' },
                { label: '🏦 Bank Ombudsman' },
                { label: '🏠 RERA' },
                { label: '📋 RTI' },
                { label: '✈️ Flight' },
              ].map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.templateChip}
                  onPress={() => navigation.navigate('Tabs', { screen: 'Advisor' })}
                >
                  <Text style={styles.templateChipText}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                <Ionicons name="flash" size={26} color={colors.bgScreen} style={styles.ctaIcon} />
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
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.caseChevron} />
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
  ctaIcon:     { marginRight: 14 },
  caseChevron: { margin: 16 },
  appNameRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryChip:       { backgroundColor: colors.bgElevated, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: colors.border },
  countryChipText:   { fontSize: 14 },
  templateRow:       { marginBottom: 20 },
  templateChips:     { gap: 8 },
  templateChip:      { backgroundColor: colors.bgElevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  templateChipText:  { fontSize: 12, color: colors.text, fontWeight: '500' },
})
