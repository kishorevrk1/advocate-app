import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { colors } from '../../theme/colors'

interface Props {
  label: string
  onPress: () => void
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  gradient?: string[]
  variant?: 'primary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export default function GradientButton({
  label, onPress, loading, disabled, style,
  gradient, variant = 'primary', size = 'lg',
}: Props) {
  const scale = useSharedValue(1)

  const gradColors = (gradient ||
    (variant === 'danger' ? [colors.danger, '#FF6B63'] :
     variant === 'ghost'  ? [colors.bgCard, colors.bgElevated] :
     colors.gradientGold as [string, string, string])) as [string, string, ...string[]]

  const textColor = (variant === 'ghost' || variant === 'primary') ? colors.bgScreen : '#FFF'
  const paddingV = size === 'lg' ? 18 : size === 'md' ? 14 : 10

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedTouchable
      style={[styles.wrapper, animStyle, style, disabled && styles.disabled]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96) }}
      onPressOut={() => { scale.value = withSpring(1.0) }}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <LinearGradient
        colors={gradColors}
        style={[styles.gradient, { paddingVertical: paddingV }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading
          ? <ActivityIndicator color={textColor} />
          : <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        }
      </LinearGradient>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  wrapper:  { borderRadius: 28, overflow: 'hidden' },
  gradient: { alignItems: 'center', justifyContent: 'center' },
  label:    { fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  disabled: { opacity: 0.4 },
})
