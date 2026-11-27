import { tracePolygon, type Point } from './geometry'

// Lips ka landmark numbers, outline ma kram milayera
const LIPS_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
const LIPS_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]

export const LIP_SHADES = [
  { name: 'None', color: '' },
  { name: 'Nude', color: '#a8645a' },
  { name: 'Pink', color: '#c2456e' },
  { name: 'Coral', color: '#d9573f' },
  { name: 'Red', color: '#b0102a' },
  { name: 'Berry', color: '#7d1f45' },
  { name: 'Maroon', color: '#5c0f1e' },
]

export function paintLipMask(
  lctx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
  color: string,
) {
  lctx.save()
  lctx.beginPath()
  tracePolygon(lctx, face, LIPS_OUTER, w, h)
  tracePolygon(lctx, face, LIPS_INNER, w, h)
  lctx.fillStyle = color
  lctx.filter = 'blur(2px)'
  lctx.fill('evenodd')
  lctx.restore()
}

export function applyLipstick(
  ctx: CanvasRenderingContext2D,
  lipLayer: HTMLCanvasElement,
  intensity: number,
) {
  ctx.save()
  // Pass 1: lips ko texture rakhera colour pherne
  ctx.globalCompositeOperation = 'color'
  ctx.globalAlpha = intensity
  ctx.drawImage(lipLayer, 0, 0)
  // Pass 2: halka multiply le depth thapne
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = intensity * 0.35
  ctx.drawImage(lipLayer, 0, 0)
  ctx.restore()
}