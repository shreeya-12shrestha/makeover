type RGB = { r: number; g: number; b: number }

export type Depth = 'very light' | 'light' | 'intermediate' | 'tan' | 'brown' | 'dark'
export type Undertone = 'warm' | 'neutral' | 'cool'

function srgbToLinear(c: number) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

// Screen ko RGB lai manche le dekhne jasto Lab colour ma badalne
export function rgbToLab({ r, g, b }: RGB) {
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)

  const X = R * 0.4124 + G * 0.3576 + B * 0.1805
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X / 0.95047)
  const fy = f(Y / 1.0)
  const fz = f(Z / 1.08883)

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

export function classifySkin(rgb: RGB) {
  const { L, a, b } = rgbToLab(rgb)

  // ITA: dermatology ko standard skin depth measure
  const ita = Math.atan2(L - 50, b) * (180 / Math.PI)
  // Hue angle: sano bhaye raato tira (cool), thulo bhaye pahelo tira (warm)
  const hue = Math.atan2(b, a) * (180 / Math.PI)

  let depth: Depth
  if (ita > 55) depth = 'very light'
  else if (ita > 41) depth = 'light'
  else if (ita > 28) depth = 'intermediate'
  else if (ita > 10) depth = 'tan'
  else if (ita > -30) depth = 'brown'
  else depth = 'dark'

  let undertone: Undertone
  if (hue >= 58) undertone = 'warm'
  else if (hue <= 50) undertone = 'cool'
  else undertone = 'neutral'

  return { L, a, b, ita, hue, depth, undertone }
}