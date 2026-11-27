import { hexToRgb } from './color'

// Multiclass model ka categories:
// 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 others
export const HAIR_CATEGORY = 1

export const HAIR_SHADES = [
  { name: 'None', color: '' },
  { name: 'Burgundy', color: '#7a1f3d' },
  { name: 'Copper', color: '#b05a2a' },
  { name: 'Honey', color: '#c08a4a' },
  { name: 'Ash Brown', color: '#7a6658' },
  { name: 'Blue Black', color: '#1f2a44' },
  { name: 'Rose Gold', color: '#c98a84' },
]

export function paintHairMask(
  hctx: CanvasRenderingContext2D,
  mask: Float32Array,
  maskWidth: number,
  maskHeight: number,
  color: string,
) {
  // Layer lai mask jattikai size dine
  const layer = hctx.canvas
  if (layer.width !== maskWidth || layer.height !== maskHeight) {
    layer.width = maskWidth
    layer.height = maskHeight
  }

  const { r, g, b } = hexToRgb(color)
  const image = hctx.createImageData(maskWidth, maskHeight)
  const data = image.data
  for (let i = 0; i < mask.length; i++) {
    const p = i * 4
    data[p] = r
    data[p + 1] = g
    data[p + 2] = b
    data[p + 3] = mask[i] * 255
  }
  hctx.putImageData(image, 0, 0)
}

export function applyHairColor(
  ctx: CanvasRenderingContext2D,
  hairLayer: HTMLCanvasElement,
  intensity: number,
) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height
  ctx.save()
  // Pass 1: kapal ko andhyaro-ujyalo jastai rakhera halka tint
  ctx.globalCompositeOperation = 'soft-light'
  ctx.globalAlpha = intensity
  ctx.drawImage(hairLayer, 0, 0, w, h)
  // Pass 2: ujyalo pareko kapal (highlights) ma colour pherne
  ctx.globalCompositeOperation = 'color'
  ctx.globalAlpha = intensity * 0.4
  ctx.drawImage(hairLayer, 0, 0, w, h)
  // Pass 3: kalo kapal ma pani alikati colour dekhiyos bhanera, dherai halka
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = intensity * 0.1
  ctx.drawImage(hairLayer, 0, 0, w, h)
  ctx.restore()
}