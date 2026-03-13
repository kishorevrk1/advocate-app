import React from 'react'
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'

interface Props {
  size?: number
}

export default function ShieldLogo({ size = 40 }: Props) {
  const w = size
  const h = size * 1.2

  return (
    <Svg width={w} height={h} viewBox="0 0 100 120">
      <Defs>
        <SvgGradient id="goldGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#E4BF6A" />
          <Stop offset="0.5" stopColor="#C9A84C" />
          <Stop offset="1" stopColor="#8B7235" />
        </SvgGradient>
      </Defs>
      {/* Shield outer fill */}
      <Path
        d="M50 4 L96 20 L96 58 C96 82 74 102 50 116 C26 102 4 82 4 58 L4 20 Z"
        fill="url(#goldGrad)"
      />
      {/* Shield inner navy cutout */}
      <Path
        d="M50 12 L88 26 L88 58 C88 78 68 96 50 108 C32 96 12 78 12 58 L12 26 Z"
        fill="#0B1120"
      />
      {/* A monogram left stroke */}
      <Path
        d="M34 88 L50 32 L66 88"
        stroke="url(#goldGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* A monogram crossbar */}
      <Path
        d="M39 68 L61 68"
        stroke="url(#goldGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  )
}
