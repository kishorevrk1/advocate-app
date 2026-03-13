import React from 'react'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient as SvgLinearGradient,
  Stop,
  Rect,
  Ellipse,
  Circle,
  G,
  Line,
  Polygon,
} from 'react-native-svg'

interface Props {
  size?: number
}

/**
 * Higuruma cursed gavel logo — Domain Expansion: Deadly Sentencing
 * Inspired by Hiromi Higuruma (JJK) — Grade 1 sorcerer who wields a Gavel as his cursed tool.
 */
export default function ShieldLogo({ size = 60 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Background */}
        <RadialGradient id="slBg" cx="45%" cy="40%" r="65%">
          <Stop offset="0%" stopColor="#121230" />
          <Stop offset="100%" stopColor="#080816" />
        </RadialGradient>

        {/* Gavel head: gold */}
        <SvgLinearGradient id="slGavelHead" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#F0D080" />
          <Stop offset="40%" stopColor="#C9A84C" />
          <Stop offset="100%" stopColor="#7A5A18" />
        </SvgLinearGradient>

        {/* Handle: dark wood */}
        <SvgLinearGradient id="slHandle" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#6B4A1E" />
          <Stop offset="50%" stopColor="#3D2808" />
          <Stop offset="100%" stopColor="#5A3A14" />
        </SvgLinearGradient>

        {/* Domain ring: purple → indigo → teal */}
        <SvgLinearGradient id="slDomain" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#C084FC" />
          <Stop offset="50%" stopColor="#818CF8" />
          <Stop offset="100%" stopColor="#2DD4BF" />
        </SvgLinearGradient>

        {/* Energy aura */}
        <RadialGradient id="slAura" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background */}
      <Rect width="100" height="100" rx="20" fill="url(#slBg)" />

      {/* Energy aura glow behind gavel */}
      <Ellipse cx="51" cy="49" rx="28" ry="26" fill="url(#slAura)" />

      {/* Domain expansion rings (broken circles) */}
      <Circle
        cx="50" cy="50" r="44"
        stroke="url(#slDomain)" strokeWidth="0.65"
        strokeDasharray="6 2 3 1" fill="none" opacity={0.6}
      />
      <Circle
        cx="50" cy="50" r="39"
        stroke="#6366F1" strokeWidth="0.4"
        strokeDasharray="3 3" fill="none" opacity={0.3}
      />

      {/* Cursed energy cracks radiating from center */}
      <Polygon
        points="50,50 56,39 58,42 64,31 67,33 60,43 64,42 57,50"
        fill="#A855F7" opacity={0.65}
      />
      <Polygon
        points="50,50 44,61 42,58 36,68 33,66 40,56 36,57 43,50"
        fill="#7C3AED" opacity={0.55}
      />
      <Polygon
        points="50,50 41,44 43,41 34,36 36,33 44,39 43,35 49,47"
        fill="#2DD4BF" opacity={0.4}
      />
      <Polygon
        points="50,50 58,56 57,59 65,63 63,67 56,61 57,65 51,53"
        fill="#818CF8" opacity={0.45}
      />

      {/* ─── GAVEL (tilted -38°, like it just struck) ─── */}
      <G rotation={-38} originX="50" originY="50">

        {/* Head shadow (depth) */}
        <Rect x="28.6" y="41.3" width="31" height="11" rx="2"
          fill="#1A0E04" opacity={0.5}
        />

        {/* Gavel head main block */}
        <Rect x="28" y="39.5" width="31" height="11" rx="2"
          fill="url(#slGavelHead)"
        />

        {/* Top highlight */}
        <Rect x="28" y="39.5" width="31" height="2.2" rx="2"
          fill="#F8E8A0" opacity={0.3}
        />

        {/* Craftsmanship score marks */}
        <Line x1="36" y1="39.5" x2="36" y2="50.5" stroke="#8B6520" strokeWidth="0.3" opacity={0.4}/>
        <Line x1="42" y1="39.5" x2="42" y2="50.5" stroke="#8B6520" strokeWidth="0.3" opacity={0.3}/>

        {/* Strike face — right end glowing */}
        <Rect x="56.5" y="39.5" width="2.5" height="11" rx="1"
          fill="#F8E8A0" opacity={0.95}
        />

        {/* Butt cap — left end */}
        <Rect x="28" y="39.5" width="2.8" height="11" rx="1.5"
          fill="#5A3A14" opacity={0.85}
        />

        {/* Handle collar / neck */}
        <Rect x="42" y="50.5" width="7" height="4" rx="0.8" fill="#4A3010"/>

        {/* Handle shaft */}
        <Rect x="44" y="54.5" width="3.5" height="20" rx="1.5"
          fill="url(#slHandle)"
        />

        {/* Grip wrapping tape */}
        <Rect x="44" y="58"   width="3.5" height="0.9" rx="0.4" fill="#2A1A06" opacity={0.65}/>
        <Rect x="44" y="61"   width="3.5" height="0.9" rx="0.4" fill="#2A1A06" opacity={0.65}/>
        <Rect x="44" y="64"   width="3.5" height="0.9" rx="0.4" fill="#2A1A06" opacity={0.65}/>
        <Rect x="44" y="67"   width="3.5" height="0.9" rx="0.4" fill="#2A1A06" opacity={0.65}/>
        <Rect x="44" y="70"   width="3.5" height="0.9" rx="0.4" fill="#2A1A06" opacity={0.65}/>

        {/* Cursed energy seal on handle */}
        <Ellipse cx="45.75" cy="71.5" rx="3" ry="1"
          stroke="#818CF8" strokeWidth="0.6" fill="none" opacity={0.9}
        />

        {/* Pommel */}
        <Ellipse cx="45.75" cy="74.5" rx="2.5" ry="1" fill="#6B4A1E"/>

      </G>

      {/* Floating cursed energy particles */}
      <Circle cx="22" cy="22" r="1.2" fill="#2DD4BF" opacity={0.9}/>
      <Circle cx="78" cy="20" r="1"   fill="#818CF8" opacity={0.8}/>
      <Circle cx="80" cy="78" r="1.4" fill="#C084FC" opacity={0.7}/>
      <Circle cx="20" cy="80" r="1"   fill="#2DD4BF" opacity={0.8}/>
      <Circle cx="14" cy="50" r="0.8" fill="#6366F1" opacity={0.7}/>
      <Circle cx="87" cy="48" r="1"   fill="#2DD4BF" opacity={0.6}/>

      {/* Center energy core */}
      <Circle cx="50" cy="50" r="2.2" fill="#C9A84C" opacity={0.7}/>
      <Circle cx="50" cy="50" r="1"   fill="#F8E8A0" opacity={0.95}/>
    </Svg>
  )
}
