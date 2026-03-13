import React, { useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Alert,
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'
import { GradientButton, ShieldLogo } from '../components/ui'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your email and password')
      return
    }
    setLoading(true)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) Alert.alert('Error', error.message)
    else if (isSignUp) Alert.alert('Check your email', 'We sent you a confirmation link.')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F1E3A', '#0B1120', '#080C14']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.inner}>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.logoBlock}>
              <ShieldLogo size={56} />
              <Text style={styles.appName}>Advocate</Text>
              <Text style={styles.tagline}>Know your rights. Fight back. Win.</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
              <TextInput
                style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              <TextInput
                style={[styles.input, focusedField === 'password' && styles.inputFocused]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <GradientButton
                label={isSignUp ? 'Create Account' : 'Sign In'}
                onPress={handleAuth}
                loading={loading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={styles.toggleLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                </Text>
              </TouchableOpacity>
              <Text style={styles.legal}>
                Advocate provides legal information, not legal advice.
              </Text>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  kav: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 32 },
  logoBlock: { alignItems: 'center' },
  appName: { fontSize: 36, fontWeight: '900', color: colors.goldBright, letterSpacing: -1 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  form: { gap: 14 },
  input: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    fontSize: 16, color: colors.text, borderWidth: 1.5, borderColor: colors.borderWhite,
  },
  inputFocused: { borderColor: colors.goldPrimary, backgroundColor: colors.surfaceBright },
  toggle: { alignItems: 'center', marginBottom: 16 },
  toggleText: { color: colors.textSecondary, fontSize: 14 },
  toggleLink: { color: colors.goldPrimary, fontWeight: '700' },
  legal: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
})
