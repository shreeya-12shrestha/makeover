import { tracePolygon, type Point } from './geometry'

// Eyelid area: aankha ko bahira ko kinara -> eyelid -> bhitra ko kinara -> crease hudai pharkine
const RIGHT_EYELID = [33, 246, 161, 160, 159, 158, 157, 173, 133, 189, 221, 222, 223, 224, 225, 113]
const LEFT_EYELID = [263, 466, 388, 387, 386, 385, 384, 398, 362, 413, 441, 442, 443, 444, 445, 342]

export const EYESHADOW_SHADES = [
  { name: 'None', color: '' },
  { name: 'Brown', color: '#7a4a32' },
  { name: 'Bronze', color: '#9c6b3c' },
  { name: 'Gold', color: '#c9a14a' },
  { name: 'Mauve', color: '#8e5a73' },
  { name: 'Plum', color: '#5e2b4f' },
  { name: 'Smoky', color: '#3b3438' },
]

export function paintEyeshadowMask(
  ectx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
  color: string,
) {
  ectx.save()
  ectx.fillStyle = color
  ectx.filter = 'blur(4px)'
  for (const lid of [RIGHT_EYELID, LEFT_EYELID]) {
    ectx.beginPath()
    tracePolygon(ectx, face, lid, w, h)
    ectx.fill()
  }
  ectx.restore()
}

export function applyEyeshadow(
  ctx: CanvasRenderingContext2D,
  eyeLayer: HTMLCanvasElement,
  intensity: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = intensity
  ctx.drawImage(eyeLayer, 0, 0)
  ctx.restore()
}