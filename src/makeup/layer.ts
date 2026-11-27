// Screen ma nadekhine chuttai canvas (layer) banaucha
export function createLayer(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Yo browser ma canvas 2D chaldaina')
  return { canvas, ctx }
}