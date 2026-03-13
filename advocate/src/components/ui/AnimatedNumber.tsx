import React, { useEffect } from 'react'
import { Text, TextStyle } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing
} from 'react-native-reanimated'

const AnimatedText = Animated.createAnimatedComponent(Text)

interface Props {
  value: number
  prefix?: string
  suffix?: string
  style?: TextStyle
  duration?: number
  formatter?: (n: number) => string
}

export default function AnimatedNumber({ value, prefix = '', suffix = '', style, duration = 1200, formatter }: Props) {
  const animValue = useSharedValue(0)

  useEffect(() => {
    animValue.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
  }, [value])

  const animProps = useAnimatedProps(() => ({
    text: `${prefix}${formatter ? formatter(Math.floor(animValue.value)) : Math.floor(animValue.value).toLocaleString()}${suffix}`,
  } as any))

  return <AnimatedText style={style} animatedProps={animProps} />
}
