import type { Point } from './geometry'

// Mathi ko parela (lash line): bahira ko kinara bata bhitra ko kinara samma
const RIGHT_LASH_LINE = [33, 246, 161, 160, 159, 158, 157, 173, 133]
const LEFT_LASH_LINE = [263, 466, 388, 387, 386, 385, 384, 398, 362]
// Face ko chaudai ra mathi tira ko direction lina
const FACE_LEFT = 234
const FACE_RIGHT = 454
const CHIN = 152
const FOREHEAD = 10

export const EYELINER_SHADES = [
  { name: 'Black', color: '#111111' },
  { name: 'Brown', color: '#3b2418' },
  { name: 'Navy', color: '#1b2440' },
  { name: 'Plum', color: '#3a1830' },
]

export function paintEyelinerMask(
  lctx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
  color: string,
  wing: boolean,
) {
  const px = (i: number) => ({ x: face[i].x * w, y: face[i].y * h })

  // Line ko motai face ko size anusar (camera najik/tada jaanda milos)
  const left = px(FACE_LEFT)
  const right = px(FACE_RIGHT)
  const thickness = Math.hypot(right.x - left.x, right.y - left.y) * 0.008

  // Face ko "mathi" direction: chin bata nidhar tira (tauko tedho bhaye pani milchha)
  const chin = px(CHIN)
  const top = px(FOREHEAD)
  const upLen = Math.hypot(top.x - chin.x, top.y - chin.y)
  const upX = (top.x - chin.x) / upLen
  const upY = (top.y - chin.y) / upLen

  lctx.save()
  lctx.strokeStyle = color
  lctx.fillStyle = color
  lctx.lineCap = 'round'
  lctx.lineJoin = 'round'
  lctx.filter = 'blur(0.6px)'

  for (const line of [RIGHT_LASH_LINE, LEFT_LASH_LINE]) {
    const pts = line.map(px)

    // Bahira (suru) motoo, bhitra (antya) patlo
    for (let i = 0; i < pts.length - 1; i++) {
      const t = i / (pts.length - 1)
      lctx.lineWidth = thickness * (1.6 - t)
      lctx.beginPath()
      lctx.moveTo(pts[i].x, pts[i].y)
      lctx.lineTo(pts[i + 1].x, pts[i + 1].y)
      lctx.stroke()
    }

    if (wing) {
      // Aankha ko direction (bhitra bata bahira tira)
      const outer = pts[0]
      const inner = pts[pts.length - 1]
      const eyeLen = Math.hypot(outer.x - inner.x, outer.y - inner.y)
      const ux = (outer.x - inner.x) / eyeLen
      const uy = (outer.y - inner.y) / eyeLen

      // Wing ko tuppo: bahira tira ra ali mathi tira
      const wingLen = eyeLen * 0.35
      const tip = {
        x: outer.x + ux * wingLen + upX * wingLen * 0.6,
        y: outer.y + uy * wingLen + upY * wingLen * 0.6,
      }

      // Tribhuj: parela ko euta point -> tuppo -> aankha ko kinara
      lctx.beginPath()
      lctx.moveTo(pts[2].x, pts[2].y)
      lctx.lineTo(tip.x, tip.y)
      lctx.lineTo(outer.x, outer.y)
      lctx.closePath()
      lctx.fill()
    }
  }

  lctx.restore()
}

export function applyEyeliner(
  ctx: CanvasRenderingContext2D,
  linerLayer: HTMLCanvasElement,
  intensity: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = intensity
  ctx.drawImage(linerLayer, 0, 0)
  ctx.restore()
}