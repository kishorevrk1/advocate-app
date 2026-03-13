import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import OnboardingNavigator from './OnboardingNavigator'
import AppNavigator from './AppNavigator'
import AuthScreen from '../screens/AuthScreen'
import { colors } from '../theme/colors'
import { initializePurchases } from '../lib/purchases'

const Stack = createStackNavigator()

export default function RootNavigator() {
  const { session, setSession, setUser, hasSeenOnboarding, isLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        initializePurchases(session?.user?.id)
      })
      .catch(() => {
        setSession(null)
        setUser(null)
        initializePurchases()
      })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) initializePurchases(session.user.id)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.goldPrimary} size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : !hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
