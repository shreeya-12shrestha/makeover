import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Model load hudai cha...')
  const [error, setError] = useState<string | null>(null)

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
        ctx.fillStyle = '#00e0a4'
        setStatus('')

        // 4. Har naya frame ma face detect garera dots draw garne
        let lastTime = -1
        const loop = () => {
          if (cancelled) return
          if (video.currentTime !== lastTime) {
            lastTime = video.currentTime
            const result = lm.detectForVideo(video, performance.now())
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            for (const face of result.faceLandmarks) {
              for (const p of face) {
                ctx.beginPath()
                ctx.arc(p.x * canvas.width, p.y * canvas.height, 1.5, 0, Math.PI * 2)
                ctx.fill()
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
    </div>
  )
}

export default App