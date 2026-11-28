// Pura camera frame ko average ujyalo (0-255).
// Chhala haina, room ko light napchha. Chhala ko colour anusar bias hudaina.
export function measureRoomLight(
  tctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
) {
  const { width, height } = tctx.canvas
  tctx.drawImage(video, 0, 0, width, height)
  const { data } = tctx.getImageData(0, 0, width, height)
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return sum / (data.length / 4)
}