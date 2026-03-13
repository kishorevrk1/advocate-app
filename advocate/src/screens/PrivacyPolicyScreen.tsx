import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'

const LAST_UPDATED = 'March 13, 2026'
const CONTACT_EMAIL = 'privacy@advocate-app.com'
const WEB_URL = 'https://advocate-app.netlify.app/privacy-policy'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
)

const Body = ({ children, style }: { children: string; style?: object }) => (
  <Text style={[styles.body, style]}>{children}</Text>
)

const Bullet = ({ children }: { children: string }) => (
  <Text style={styles.bullet}>• {children}</Text>
)

export default function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(WEB_URL)}>
          <Text style={styles.webLink}>View online ↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.highlight}>
          <Text style={styles.highlightText}>
            Advocate is an AI-powered legal information tool. We take your privacy seriously. Your case details are used only to generate legal information for you and are never sold or used for advertising.
          </Text>
        </View>

        <Section title="1. What We Collect">
          <Body>We collect the following information when you use Advocate:</Body>
          <Bullet>Account information: email address and password (via Supabase Auth)</Bullet>
          <Bullet>Case data: dispute descriptions, opponent names, amounts, and states/regions you enter</Bullet>
          <Bullet>Generated documents: demand letters, phone scripts, and case analyses stored to your account</Bullet>
          <Bullet>Usage data: app interactions and feature usage (via Mixpanel, if enabled)</Bullet>
          <Bullet>Purchase information: subscription status (via RevenueCat — we never see your payment card details)</Bullet>
        </Section>

        <Section title="2. How We Use Your Data">
          <Body>Your data is used exclusively to:</Body>
          <Bullet>Generate AI-powered legal information relevant to your dispute</Bullet>
          <Bullet>Store your cases and documents so you can access them later</Bullet>
          <Bullet>Improve the app experience (aggregated, anonymized analytics only)</Bullet>
          <Bullet>Send important account notifications (no marketing without consent)</Bullet>
        </Section>

        <Section title="3. AI Processing Disclosure">
          <Body>
            IMPORTANT: When you submit a case for analysis, the description you provide is sent to a third-party AI service (Groq, Inc. or Anthropic, PBC) to generate legal information. Please do not include highly sensitive personal information (such as full SSNs, bank account numbers, or medical records) in your case descriptions.
          </Body>
          <Body style={{ marginTop: 8 }}>
            AI providers process your data under their own privacy policies and do not retain your data for training purposes under their API terms of service.
          </Body>
        </Section>

        <Section title="4. Third-Party Services">
          <Body>We use the following trusted third-party services:</Body>
          <Bullet>Supabase (supabase.com) — database and authentication</Bullet>
          <Bullet>Groq, Inc. / Anthropic, PBC — AI text generation</Bullet>
          <Bullet>RevenueCat (revenuecat.com) — in-app purchases and subscriptions</Bullet>
          <Bullet>Mixpanel (mixpanel.com) — anonymous usage analytics</Bullet>
          <Body style={{ marginTop: 8 }}>
            Each provider operates under their own privacy policy. We do not sell your data to any third party.
          </Body>
        </Section>

        <Section title="5. Data Storage & Security">
          <Bullet>Your data is stored in encrypted Supabase databases (hosted on AWS)</Bullet>
          <Bullet>All data transmission uses HTTPS/TLS encryption</Bullet>
          <Bullet>Row-level security ensures you can only access your own cases</Bullet>
          <Bullet>We retain your data as long as your account is active</Bullet>
        </Section>

        <Section title="6. Your Rights">
          <Body>You have the right to:</Body>
          <Bullet>Access all data we hold about you</Bullet>
          <Bullet>Export your case data at any time</Bullet>
          <Bullet>Delete your account and all associated data</Bullet>
          <Bullet>Opt out of analytics tracking</Bullet>
          <Body style={{ marginTop: 8 }}>
            EU/UK users (GDPR): You have the right to data portability, restriction of processing, and to lodge a complaint with your supervisory authority.
          </Body>
          <Body style={{ marginTop: 8 }}>
            California users (CCPA): You have the right to know what personal information is collected, to delete it, and to opt out of its sale (we do not sell data).
          </Body>
        </Section>

        <Section title="7. Children's Privacy">
          <Body>
            Advocate is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us immediately.
          </Body>
        </Section>

        <Section title="8. Changes to This Policy">
          <Body>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via the app. Continued use of the app after changes constitutes acceptance of the updated policy.
          </Body>
        </Section>

        <Section title="9. Contact Us">
          <Body>
            For privacy questions, data requests, or account deletion, contact us at:
          </Body>
          <Text style={styles.email}>{CONTACT_EMAIL}</Text>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Advocate is not a law firm. Nothing in this app constitutes legal advice. For complex legal matters, always consult a licensed attorney.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bgScreen },
  header:       { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  back:         { color: colors.primary, fontSize: 16, marginBottom: 12 },
  title:        { fontSize: 26, fontWeight: '800', color: colors.text },
  updated:      { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  scroll:       { flex: 1 },
  content:      { padding: 24, paddingBottom: 60 },
  highlight: {
    backgroundColor: colors.primary + '18',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.primary + '40',
    marginBottom: 24,
  },
  highlightText: { fontSize: 14, color: colors.text, lineHeight: 22 },
  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.goldPrimary, marginBottom: 10 },
  body:         { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  bullet:       { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 4, paddingLeft: 8 },
  email:        { fontSize: 15, color: colors.primary, fontWeight: '600', marginTop: 4 },
  webLink:      { fontSize: 13, color: colors.primary, marginTop: 4 },
  footer: {
    marginTop: 16, padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  footerText:   { fontSize: 12, color: colors.textMuted, lineHeight: 18, textAlign: 'center' },
})
