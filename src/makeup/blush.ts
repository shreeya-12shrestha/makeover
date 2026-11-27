import type { Point } from './geometry'

// Gaala (cheek) ko bichko area chhune landmarks: baya ra daya
const LEFT_CHEEK = [50, 117, 123, 187, 205]
const RIGHT_CHEEK = [280, 346, 352, 411, 425]
// Face ka dubai kinara: anuhar kati chaudai cha nikalna
const FACE_LEFT = 234
const FACE_RIGHT = 454

export const BLUSH_SHADES = [
  { name: 'None', color: '' },
  { name: 'Peach', color: '#e8957a' },
  { name: 'Pink', color: '#e07a95' },
  { name: 'Rose', color: '#c95b6e' },
  { name: 'Coral', color: '#e9725a' },
  { name: 'Berry', color: '#a8476a' },
]

function averagePoint(face: Point[], indices: number[], w: number, h: number) {
  let x = 0
  let y = 0
  for (const idx of indices) {
    x += face[idx].x
    y += face[idx].y
  }
  return { x: (x / indices.length) * w, y: (y / indices.length) * h }
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function paintBlushMask(
  bctx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
  color: string,
) {
  const left = face[FACE_LEFT]
  const right = face[FACE_RIGHT]
  const faceWidth = Math.hypot((right.x - left.x) * w, (right.y - left.y) * h)
  const radius = faceWidth * 0.13
  const { r, g, b } = hexToRgb(color)

  for (const cheek of [LEFT_CHEEK, RIGHT_CHEEK]) {
    const c = averagePoint(face, cheek, w, h)
    const grad = bctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius)
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
    bctx.fillStyle = grad
    bctx.beginPath()
    bctx.arc(c.x, c.y, radius, 0, Math.PI * 2)
    bctx.fill()
  }
}

export function applyBlush(
  ctx: CanvasRenderingContext2D,
  blushLayer: HTMLCanvasElement,
  intensity: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = intensity
  ctx.drawImage(blushLayer, 0, 0)
  ctx.restore()
}