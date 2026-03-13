import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { colors } from '../../theme/colors'

interface Props {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  glow?: string
  gold?: boolean
}

export default function GlassCard({ children, style, glow, gold }: Props) {
  return (
    <View
      style={[
        styles.card,
        glow ? { shadowColor: glow, shadowOpacity: 0.30, shadowRadius: 16, elevation: 8 } : styles.shadow,
        gold ? styles.goldBorder : styles.defaultBorder,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  defaultBorder: { borderColor: colors.border },
  goldBorder:    { borderColor: colors.borderBright },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 4,
  },
})
