import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'
import { GlassCard } from '../components/ui'
import { useAuthStore } from '../store/authStore'
import { checkProStatus, restorePurchases } from '../lib/purchases'

export default function SettingsScreen({ navigation }: any) {
  const { user, signOut } = useAuthStore()
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    checkProStatus().then(setIsPro)
  }, [])

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ])
  }

  const handleRestore = async () => {
    try {
      const restored = await restorePurchases()
      setIsPro(restored)
      Alert.alert(restored ? '✅ Pro Restored!' : 'No purchases found', restored ? 'Welcome back to Advocate Pro!' : 'No active subscription was found for this account.')
    } catch (_e) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.')
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{user?.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Plan</Text>
            {isPro ? (
              <LinearGradient colors={colors.gradientGold as [string,string,string]} style={styles.proBadge} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </LinearGradient>
            ) : (
              <View style={styles.planBadge}>
                <Text style={styles.planText}>Free</Text>
              </View>
            )}
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>
          <TouchableOpacity style={styles.button} onPress={handleRestore}>
            <Text style={styles.buttonText}>Restore Purchases</Text>
          </TouchableOpacity>
          {!isPro && (
            <Text style={styles.upgradeHint}>
              Upgrade to Pro for unlimited cases, full PDFs, and all scripts.
            </Text>
          )}
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL & PRIVACY</Text>
          <Text style={styles.legalText}>
            Advocate provides legal information only, not legal advice. AI-generated content is for educational purposes. Always consult a licensed attorney for important matters.
          </Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionLabel}>APP</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </GlassCard>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 32 },
  section: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.goldPrimary, marginBottom: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  rowLabel: { fontSize: 15, color: colors.textSecondary },
  rowValue: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  planBadge: { backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  planText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  proBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  proBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  button: {
    backgroundColor: colors.primary + '22', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.primary,
  },
  buttonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  upgradeHint: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 12 },
  legalText: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 12 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  linkText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
  linkArrow: { fontSize: 20, color: colors.textMuted },
  signOutButton: {
    backgroundColor: colors.dangerDim, borderRadius: 14, paddingVertical: 18,
    alignItems: 'center', borderWidth: 1, borderColor: colors.danger,
  },
  signOutText: { color: colors.danger, fontSize: 16, fontWeight: '700' },
})
