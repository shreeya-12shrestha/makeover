import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import { paintLipMask, applyLipstick } from './makeup/lips'
import { paintBlushMask, applyBlush } from './makeup/blush'
import { paintEyeshadowMask, applyEyeshadow } from './makeup/eyeshadow'
import { HAIR_CATEGORY, HAIR_SHADES, paintHairMask, applyHairColor } from './makeup/hair'
import { createLayer } from './makeup/layer'
import { sampleSkinColor } from './analysis/skin'
import { classifySkin } from './analysis/tone'
import { recommendLook } from './analysis/recommend'
import { ShadePicker } from './components/ShadePicker'
import './App.css'

type RGB = { r: number; g: number; b: number }

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState('Model load hudai cha...')
  const [error, setError] = useState<string | null>(null)

  // ===== Makeup settings (Analyze nagarunjel khali) =====
  const [shade, setShade] = useState('')
  const [intensity, setIntensity] = useState(0.6)
  const [blushShade, setBlushShade] = useState('')
  const [blushIntensity, setBlushIntensity] = useState(0.4)
  const [eyeShade, setEyeShade] = useState('')
  const [eyeIntensity, setEyeIntensity] = useState(0.5)
  const [hairShade, setHairShade] = useState('')
  const [hairIntensity, setHairIntensity] = useState(0.5)

  // ===== AI analysis =====
  const [skin, setSkin] = useState<RGB | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  // Scan: kati frames baki cha, ani ahile samma ko colour ko jod
  const analyzeRef = useRef({ framesLeft: 0, r: 0, g: 0, b: 0, count: 0 })
  // Look = ahile lagayeko sabai makeup ko settings, eutai box ma
  const lookRef = useRef({
    lipColor: shade,
    lipIntensity: intensity,
    blushColor: blushShade,
    blushIntensity,
    eyeColor: eyeShade,
    eyeIntensity,
    hairColor: hairShade,
    hairIntensity,
  })

  useEffect(() => {
    lookRef.current = {
      lipColor: shade,
      lipIntensity: intensity,
      blushColor: blushShade,
      blushIntensity,
      eyeColor: eyeShade,
      eyeIntensity,
      hairColor: hairShade,
      hairIntensity,
    }
  }, [shade, intensity, blushShade, blushIntensity, eyeShade, eyeIntensity, hairShade, hairIntensity])

  // ===== Camera + models + detection loop (page khulda ekchoti) =====
  useEffect(() => {
    let stream: MediaStream | null = null
    let landmarker: FaceLandmarker | null = null
    let segmenter: ImageSegmenter | null = null
    let rafId = 0
    let cancelled = false

    function stopAll() {
      cancelAnimationFrame(rafId)
      stream?.getTracks().forEach((t) => t.stop())
      stream = null
      landmarker?.close()
      landmarker = null
      segmenter?.close()
      segmenter = null
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

        // 1b. Kapal chhuttaune model load garne
        const seg = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/selfie_multiclass.tflite',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        })
        segmenter = seg
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

        // Har makeup ko lagi screen ma nadekhine chuttai layer
        const { canvas: lipLayer, ctx: lctx } = createLayer(canvas.width, canvas.height)
        const { canvas: blushLayer, ctx: bctx } = createLayer(canvas.width, canvas.height)
        const { canvas: eyeLayer, ctx: ectx } = createLayer(canvas.width, canvas.height)
        const { canvas: hairLayer, ctx: hctx } = createLayer(canvas.width, canvas.height)

        setStatus('')

        // 4. Har naya frame: camera frame, analysis, ani makeup
        let lastTime = -1
        const loop = () => {
          if (cancelled) return
          if (video.currentTime !== lastTime) {
            lastTime = video.currentTime
            const result = lm.detectForVideo(video, performance.now())

            // Camera ko frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            // Analyze: makeup lagaunu aghi chhala napne, ani AI le look choose garne
            const firstFace = result.faceLandmarks[0]
            if (analyzeRef.current && firstFace) {
              const measured = sampleSkinColor(ctx, firstFace, canvas.width, canvas.height)
              const info = classifySkin(measured)
              const rec = recommendLook(info.depth, info.undertone)
              setSkin(measured)
              setShade(rec.lips[0].color)
              setBlushShade(rec.blush[0].color)
              setEyeShade(rec.eyeshadow[0].color)
              analyzeRef.current = false
            }

            const look = lookRef.current

            // Kapal: hair colour chhaneko bela matra segmentation chalaune
            if (look.hairColor) {
              seg.segmentForVideo(video, performance.now(), (segResult) => {
                const hairMask = segResult.confidenceMasks?.[HAIR_CATEGORY]
                if (!hairMask) return
                paintHairMask(
                  hctx,
                  hairMask.getAsFloat32Array(),
                  hairMask.width,
                  hairMask.height,
                  look.hairColor,
                )
              })
              applyHairColor(ctx, hairLayer, look.hairIntensity)
            }

            // Blush
            if (look.blushColor) {
              bctx.clearRect(0, 0, blushLayer.width, blushLayer.height)
              for (const face of result.faceLandmarks) {
                paintBlushMask(bctx, face, blushLayer.width, blushLayer.height, look.blushColor)
              }
              applyBlush(ctx, blushLayer, look.blushIntensity)
            }

            // Eyeshadow
            if (look.eyeColor) {
              ectx.clearRect(0, 0, eyeLayer.width, eyeLayer.height)
              for (const face of result.faceLandmarks) {
                paintEyeshadowMask(ectx, face, eyeLayer.width, eyeLayer.height, look.eyeColor)
              }
              applyEyeshadow(ctx, eyeLayer, look.eyeIntensity)
            }

            // Lipstick
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

  // ===== UI =====
  const skinInfo = skin ? classifySkin(skin) : null
  const rec = skinInfo ? recommendLook(skinInfo.depth, skinInfo.undertone) : null

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
        <h2>AI Analysis</h2>
        <button className="analyze-btn" onClick={() => { analyzeRef.current = true }}>
          {skin ? 'Analyze again' : 'Analyze my face'}
        </button>
        {skin && skinInfo && rec && (
          <>
            <div className="skin-result">
              <span
                className="skin-swatch"
                style={{ background: `rgb(${skin.r}, ${skin.g}, ${skin.b})` }}
              />
              <div>
                <div>Depth: <b>{skinInfo.depth}</b></div>
                <div>Undertone: <b>{skinInfo.undertone}</b></div>
                <div className="skin-numbers">
                  ITA {skinInfo.ita.toFixed(1)}° · Hue {skinInfo.hue.toFixed(1)}°
                </div>
              </div>
            </div>
            <p className="skin-reason">{rec.reason}</p>
          </>
        )}
      </section>

      {rec && (
        <>
          <ShadePicker
            title="Lipstick"
            shades={rec.lips}
            selected={shade}
            onSelect={setShade}
            intensity={intensity}
            onIntensityChange={setIntensity}
          />

          <ShadePicker
            title="Blush"
            shades={rec.blush}
            selected={blushShade}
            onSelect={setBlushShade}
            intensity={blushIntensity}
            onIntensityChange={setBlushIntensity}
          />

          <ShadePicker
            title="Eyeshadow"
            shades={rec.eyeshadow}
            selected={eyeShade}
            onSelect={setEyeShade}
            intensity={eyeIntensity}
            onIntensityChange={setEyeIntensity}
          />
        </>
      )}

      <ShadePicker
        title="Hair colour (beta)"
        shades={HAIR_SHADES}
        selected={hairShade}
        onSelect={setHairShade}
        intensity={hairIntensity}
        onIntensityChange={setHairIntensity}
      />
    </div>
  )
}

export default App