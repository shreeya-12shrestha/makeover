import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import './App.css'

// Lips ka landmark numbers, outline ma kram milayera
const LIPS_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
const LIPS_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
const SHADES = [
  { name: 'None', color: '' },
  { name: 'Nude', color: '#a8645a' },
  { name: 'Pink', color: '#c2456e' },
  { name: 'Coral', color: '#d9573f' },
  { name: 'Red', color: '#b0102a' },
  { name: 'Berry', color: '#7d1f45' },
  { name: 'Maroon', color: '#5c0f1e' },
]

type Point = { x: number; y: number }

function tracePolygon(
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

function drawLips(
  ctx: CanvasRenderingContext2D,
  face: Point[],
  w: number,
  h: number,
  color: string,
  opacity: number,
) {
  ctx.save()
  ctx.beginPath()
  tracePolygon(ctx, face, LIPS_OUTER, w, h)
  tracePolygon(ctx, face, LIPS_INNER, w, h)
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.filter = 'blur(2px)'
  ctx.fill('evenodd')
  ctx.restore()
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Model load hudai cha...')
  const [error, setError] = useState<string | null>(null)
  const [shade, setShade] = useState(SHADES[4].color)
  const [intensity, setIntensity] = useState(0.6)
  const lipRef = useRef({ color: shade, intensity })

  useEffect(() => {
    lipRef.current = { color: shade, intensity }
  }, [shade, intensity])

  useEffect(() => {
    let stream: MediaStream | null = null
    let landmarker: FaceLandmarker | null = null
    let rafId = 0
    let cancelled = false

    function stopAll() {
      cancelAnimationFrame(rafId)
      stream?.getTracks().forEach((t) => t.stop())
      stream = null
      landmarker?.close()
      landmarker = null
    }

    async function start() {
      try {
        // 1. Engine ra face model load garne
        const vision = await FilesetResolver.forVisionTasks('/mediapipe-wasm')
        const lm = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
        landmarker = lm
        if (cancelled) { stopAll(); return }

        // 2. Camera kholne
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelled) { stopAll(); return }

        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return
        video.srcObject = stream
        await video.play()
        if (cancelled) { stopAll(); return }

        // 3. Canvas lai video jattikai size dine
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        setStatus('')

        // 4. Har naya frame ma face detect garera dots draw garne
        let lastTime = -1
        const loop = () => {
          if (cancelled) return
          if (video.currentTime !== lastTime) {
            lastTime = video.currentTime
            const result = lm.detectForVideo(video, performance.now())
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const lip = lipRef.current
            if (lip.color) {
              for (const face of result.faceLandmarks) {
                drawLips(ctx, face, canvas.width, canvas.height, lip.color, lip.intensity)
              }
            }
          }
          rafId = requestAnimationFrame(loop)
        }
        loop()
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      }
    }

    start()

    return () => {
      cancelled = true
      stopAll()
    }
  }, [])

  return (
    <div className="app">
      <h1>Makeover</h1>
      {status && <p>{status}</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="stage">
        <video ref={videoRef} autoPlay playsInline muted className="camera" />
        <canvas ref={canvasRef} className="overlay" />
      </div>

      <div className="shades">
        {SHADES.map((s) => (
          <button
            key={s.name}
            title={s.name}
            className={`shade ${shade === s.color ? 'active' : ''}`}
            style={{ background: s.color || 'transparent' }}
            onClick={() => setShade(s.color)}
          >
            {s.color ? '' : 'None'}
          </button>
        ))}
      </div>

      <label className="intensity">
        Intensity: {Math.round(intensity * 100)}%
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
        />
      </label>
    </div>
  )
}

export default App