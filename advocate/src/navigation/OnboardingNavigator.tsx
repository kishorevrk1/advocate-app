import React, { useState } from 'react'
import { View } from 'react-native'
import OnboardingScreen1 from '../screens/onboarding/OnboardingScreen1'
import OnboardingScreen2 from '../screens/onboarding/OnboardingScreen2'
import OnboardingScreen3 from '../screens/onboarding/OnboardingScreen3'
import PaywallScreen from '../screens/PaywallScreen'
import { useAuthStore } from '../store/authStore'

export default function OnboardingNavigator() {
  const [step, setStep] = useState(0)
  const { setHasSeenOnboarding } = useAuthStore()

  const completeOnboarding = () => {
    setHasSeenOnboarding(true)
  }

  const screens = [
    <OnboardingScreen1 key="s1" onNext={() => setStep(1)} />,
    <OnboardingScreen2 key="s2" onNext={() => setStep(2)} />,
    <OnboardingScreen3 key="s3" onNext={() => setStep(3)} />,
    <PaywallScreen key="s4" onSuccess={completeOnboarding} onSkip={completeOnboarding} />,
  ]

  return <View style={{ flex: 1 }}>{screens[step]}</View>
}
