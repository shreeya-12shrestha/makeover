import type { Point } from '../makeup/geometry'

// Chhala ko colour napne thau: dubai gaala, gaala ko tala ko bhaag, ani nidhar
const SKIN_SAMPLE_POINTS = [117, 346, 205, 425, 151]

export function sampleSkinColor(
  ctx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
) {
  const size = Math.max(4, Math.round(w * 0.015))
  let r = 0
  let g = 0
  let b = 0
  let count = 0

  for (const idx of SKIN_SAMPLE_POINTS) {
    const x = Math.round(face[idx].x * w - size / 2)
    const y = Math.round(face[idx].y * h - size / 2)
    const { data } = ctx.getImageData(x, y, size, size)
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  }
}