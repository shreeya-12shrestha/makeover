export type Point = { x: number; y: number }

export function tracePolygon(
  ctx: CanvasRenderingContext2D,
  face: Point[],
  indices: number[],
  w: number,
  h: number,
) {
  indices.forEach((idx, i) => {
    const p = face[idx]
    if (i === 0) ctx.moveTo(p.x * w, p.y * h)
    else ctx.lineTo(p.x * w, p.y * h)
  })
  ctx.closePath()
}