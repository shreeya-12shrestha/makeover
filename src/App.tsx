import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { LIP_SHADES, paintLipMask, applyLipstick } from './makeup/lips'
import { BLUSH_SHADES, paintBlushMask, applyBlush } from './makeup/blush'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Model load hudai cha...')
  const [error, setError] = useState<string | null>(null)
  const [shade, setShade] = useState(LIP_SHADES[4].color)
  const [intensity, setIntensity] = useState(0.6)
  const [blushShade, setBlushShade] = useState(BLUSH_SHADES[2].color)
  const [blushIntensity, setBlushIntensity] = useState(0.4)


  // Look = ahile lagayeko sabai makeup ko settings, eutai box ma
  const lookRef = useRef({
    lipColor: shade,
    lipIntensity: intensity,
    blushColor: blushShade,
    blushIntensity,
  })

  useEffect(() => {
    lookRef.current = {
      lipColor: shade,
      lipIntensity: intensity,
      blushColor: blushShade,
      blushIntensity,
    }
  }, [shade, intensity, blushShade, blushIntensity])
  // Camera + model + detection loop (page khulda ekchoti)
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

        // Lipstick ko lagi lukeko chuttai canvas (screen ma dekhidaina)
        const lipLayer = document.createElement('canvas')
        lipLayer.width = canvas.width
        lipLayer.height = canvas.height
        const lctx = lipLayer.getContext('2d')
        if (!lctx) return

        
        // Blush ko lagi arko lukeko canvas
        const blushLayer = document.createElement('canvas')
        blushLayer.width = canvas.width
        blushLayer.height = canvas.height
        const bctx = blushLayer.getContext('2d')
        if (!bctx) return

        setStatus('')

        // 4. Har naya frame: camera frame draw, ani makeup milaaune
        let lastTime = -1
        const loop = () => {
          if (cancelled) return
          if (video.currentTime !== lastTime) {
            lastTime = video.currentTime
            const result = lm.detectForVideo(video, performance.now())

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            const look = lookRef.current
            // Blush pahile (chhala ma), lipstick pachi
            if (look.blushColor) {
              bctx.clearRect(0, 0, blushLayer.width, blushLayer.height)
              for (const face of result.faceLandmarks) {
                paintBlushMask(bctx, face, blushLayer.width, blushLayer.height, look.blushColor)
              }
              applyBlush(ctx, blushLayer, look.blushIntensity)
            }
            if (look.lipColor) {
              lctx.clearRect(0, 0, lipLayer.width, lipLayer.height)
              for (const face of result.faceLandmarks) {
                paintLipMask(lctx, face, lipLayer.width, lipLayer.height, look.lipColor)
              }
              applyLipstick(ctx, lipLayer, look.lipIntensity)
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

      <section className="controls">
        <h2>Lipstick</h2>
        <div className="shades">
          {LIP_SHADES.map((s) => (
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
      </section>

      <section className="controls">
        <h2>Blush</h2>
        <div className="shades">
          {BLUSH_SHADES.map((s) => (
            <button
              key={s.name}
              title={s.name}
              className={`shade ${blushShade === s.color ? 'active' : ''}`}
              style={{ background: s.color || 'transparent' }}
              onClick={() => setBlushShade(s.color)}
            >
              {s.color ? '' : 'None'}
            </button>
          ))}
        </div>
        <label className="intensity">
          Intensity: {Math.round(blushIntensity * 100)}%
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={blushIntensity}
            onChange={(e) => setBlushIntensity(Number(e.target.value))}
          />
        </label>
      </section>
    </div>
  )
}

export default App