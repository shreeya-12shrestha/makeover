import { tracePolygon, type Point } from './geometry'

// Eyelid area: aankha ko kinara -> eyelid -> bhitra ko kinara -> lid mathi hudai pharkine
const RIGHT_EYELID = [33, 246, 161, 160, 159, 158, 157, 173, 133, 190, 56, 28, 27, 29, 30, 247]
const LEFT_EYELID = [263, 466, 388, 387, 386, 385, 384, 398, 362, 414, 286, 258, 257, 259, 260, 467]

// Aankha ko khulla bhaag (seto bhaag + nani): yaha colour lagnu hudaina
const RIGHT_EYE_OPENING = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
const LEFT_EYE_OPENING = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]

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

  // 1. Eyelid ma colour, narm edge sanga
  ectx.fillStyle = color
  ectx.filter = 'blur(3px)'
  for (const lid of [RIGHT_EYELID, LEFT_EYELID]) {
    ectx.beginPath()
    tracePolygon(ectx, face, lid, w, h)
    ectx.fill()
  }

  // 2. Aankha bhitra pokhiyeko colour mетaune
  ectx.filter = 'none'
  ectx.globalCompositeOperation = 'destination-out'
  for (const eye of [RIGHT_EYE_OPENING, LEFT_EYE_OPENING]) {
    ectx.beginPath()
    tracePolygon(ectx, face, eye, w, h)
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
  // Pass 1: chhala ko texture rakhera colour dine (kharani hudaina)
  ctx.globalCompositeOperation = 'color'
  ctx.globalAlpha = intensity * 0.6
  ctx.drawImage(eyeLayer, 0, 0)
  // Pass 2: halka multiply le depth
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = intensity * 0.4
  ctx.drawImage(eyeLayer, 0, 0)
  ctx.restore()
}