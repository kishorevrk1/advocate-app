import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PurchasesPackage } from 'react-native-purchases'
import { colors } from '../theme/colors'
import { GlassCard, GradientButton } from '../components/ui'
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases'

const FEATURES = [
  { icon: '📋', text: 'Unlimited cases' },
  { icon: '📄', text: 'Full PDF demand letters' },
  { icon: '📞', text: 'Phone call scripts with pushback' },
  { icon: '🎯', text: 'Step-by-step escalation tracker' },
  { icon: '⚖️', text: 'State-specific legal rights lookup' },
  { icon: '⚡', text: 'AI case analysis in 60 seconds' },
]

interface Props { onSuccess: () => void; onSkip?: () => void }

export default function PaywallScreen({ onSuccess, onSkip }: Props) {
  const [packages, setPackages] = useState<PurchasesPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    getOfferings().then(offering => {
      if (offering?.availablePackages?.length) {
        setPackages(offering.availablePackages)
        setSelectedPkg(offering.availablePackages.find((p: PurchasesPackage) => p.packageType === 'ANNUAL') || offering.availablePackages[0])
      }
      setLoading(false)
    })
  }, [])

  const handlePurchase = async () => {
    if (!selectedPkg) return
    setPurchasing(true)
    try {
      if (await purchasePackage(selectedPkg)) onSuccess()
    } catch (e: any) {
      if (!e.userCancelled) Alert.alert('Purchase failed', e.message || 'Please try again')
    }
    setPurchasing(false)
  }

  const handleRestore = async () => {
    const restored = await restorePurchases()
    if (restored) onSuccess()
    else Alert.alert('No purchases found', 'No active subscription found for this account.')
  }

  if (loading) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  )

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F1E3A', '#0B1120', colors.bgScreen] as [string,string,string]} style={StyleSheet.absoluteFill} start={{x:0.5,y:0}} end={{x:0.5,y:1}} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.step}>STEP 3 OF 3</Text>
            <Text style={styles.title}>Start Fighting Back</Text>
            <Text style={styles.subtitle}>7-day free trial · Cancel anytime</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </Animated.View>

          {packages.length > 0 ? (
            <>
              <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.packages}>
                {packages.map((pkg: PurchasesPackage) => {
                  const isAnnual = pkg.packageType === 'ANNUAL'
                  const isSelected = selectedPkg?.identifier === pkg.identifier
                  return (
                    <TouchableOpacity key={pkg.identifier} onPress={() => setSelectedPkg(pkg)} activeOpacity={0.85} style={styles.pkgTouchable}>
                      <GlassCard style={[styles.pkgCard, isSelected && { borderColor: colors.primary }]} glow={isSelected ? colors.primary : undefined}>
                        {isAnnual && (
                          <LinearGradient colors={colors.gradientAccent as [string,string]} style={styles.bestBadge} start={{x:0,y:0}} end={{x:1,y:0}}>
                            <Text style={styles.bestText}>SAVE 40%</Text>
                          </LinearGradient>
                        )}
                        <Text style={[styles.pkgTitle, isSelected && { color: colors.primary }]}>
                          {isAnnual ? 'Annual' : 'Monthly'}
                        </Text>
                        <Text style={styles.pkgPrice}>
                          {pkg.product.priceString}{isAnnual ? '/yr' : '/mo'}
                        </Text>
                        {isAnnual && <Text style={styles.pkgNote}>= $5.83/month</Text>}
                      </GlassCard>
                    </TouchableOpacity>
                  )
                })}
              </Animated.View>

              <GradientButton label={purchasing ? '' : 'Start Free Trial →'} onPress={handlePurchase} loading={purchasing} style={{ marginBottom: 14 }} />
            </>
          ) : (
            <>
              <GlassCard style={styles.devNote}>
                <Text style={styles.devNoteText}>⚙️ RevenueCat not configured. Add EXPO_PUBLIC_REVENUECAT_KEY to .env</Text>
              </GlassCard>
              {onSkip && (
                <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip for now (Development)</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity onPress={handleRestore} style={styles.restore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Subscription auto-renews. Cancel anytime in Google Play settings.{'\n'}
            This is an informational tool, not legal advice.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 },
  step: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.accent, fontWeight: '600', marginBottom: 28 },
  features: { marginBottom: 28, gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  featureEmoji: { fontSize: 18 },
  featureText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  packages: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pkgTouchable: { flex: 1 },
  pkgCard: { padding: 18, alignItems: 'center' },
  bestBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  bestText: { fontSize: 9, fontWeight: '800', color: colors.background },
  pkgTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  pkgPrice: { fontSize: 18, fontWeight: '900', color: colors.text },
  pkgNote: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  devNote: { padding: 16, marginBottom: 16 },
  devNoteText: { color: colors.warning, fontSize: 13, lineHeight: 20 },
  skipBtn: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  skipText: { color: colors.textSecondary, fontSize: 15 },
  restore: { alignItems: 'center', marginBottom: 20 },
  restoreText: { color: colors.textSecondary, fontSize: 14 },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
})
