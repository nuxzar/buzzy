import { useEffect, useRef, useState } from 'react'
import GradientWaves from './components/GradientWaves/GradientWaves'
import SideRays from './components/SideRays/SideRays'
import LiquidObject from './components/canvasui/LiquidObject'
import BgmToggle from './components/BgmToggle'
import BootScreen from './components/BootScreen'
import SiteLayer from './components/SiteLayer'
import TrailCopy from './components/TrailCopy'
import Quiz from './components/Quiz'
import Bubbles from './components/Bubbles'
import { BRAND } from './data/copy'
import './App.css'

const BOOT_LEAVE_MS = 900
const MODEL_SRC =
  'https://pub-1dad2170fdae4bf6906ef4d6dffac632.r2.dev/base_basic_shaded_opt.glb'
const MODEL_FALLBACK_SRC = '/models/base_basic_shaded_opt.glb'

function getModelFit() {
  const fov = 58
  const cameraDistance = 6
  const fallback = { scale: 2.2, cameraDistance, fov, xOffset: 0, yOffset: -0.12 }

  if (typeof window === 'undefined') return fallback

  const w = window.visualViewport?.width ?? window.innerWidth
  const h = window.visualViewport?.height ?? window.innerHeight
  const aspect = w / Math.max(h, 1)
  const vfov = (fov * Math.PI) / 180
  const visibleWidth = 2 * Math.tan(vfov / 2) * cameraDistance * aspect

  const isPhone = w < 768 || aspect < 0.82
  const isTablet = !isPhone && w < 1100

  let widthRatio
  if (isPhone) {
    widthRatio = 0.8
  } else if (isTablet) {
    widthRatio = 0.5
  } else {
    const sizeBoost = Math.min(Math.max(Math.min(w, h) / 1080, 0.88), 1.1)
    widthRatio = 0.32 * sizeBoost
  }

  return {
    scale: visibleWidth * widthRatio,
    cameraDistance,
    fov,
    xOffset: 0,
    yOffset: -0.12,
  }
}

function App() {
  const fishRef = useRef(null)
  const bgmRef = useRef(null)
  const [fit, setFit] = useState(getModelFit)
  const [showFish, setShowFish] = useState(true)
  const [fishKey, setFishKey] = useState(0)
  const [giftOpen, setGiftOpen] = useState(false)
  const [boot, setBoot] = useState('loading')
  const [progress, setProgress] = useState(0)
  const [bootError, setBootError] = useState(null)
  const [fishArrived, setFishArrived] = useState(false)

  const live = boot === 'live'
  const booting = boot !== 'live'

  useEffect(() => {
    const update = () => setFit(getModelFit())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [])

  function handleEnter() {
    if (boot !== 'ready') return
    bgmRef.current?.playFromGesture()
    setBoot('leaving')
    window.setTimeout(() => setBoot('live'), BOOT_LEAVE_MS)
  }

  function handleRetry() {
    setBootError(null)
    setProgress(0)
    setBoot('loading')
    setFishArrived(false)
    setFishKey((key) => key + 1)
  }

  return (
    <div className="app">
      <div className="app-waves" aria-hidden="true">
        <GradientWaves
          horizonColor="#000fff"
          waveColor="#0061ff"
          crestColor="#ffffff"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          grain={false}
          mouseInteraction
          parallaxStrength={0.5}
        />
      </div>
      <div className="app-rays" aria-hidden="true">
        <SideRays
          rayColor1="#ffffff"
          rayColor2="#9bc1ff"
          origin="top-right"
          speed={2.5}
          intensity={3}
          spread={1.6}
          tilt={22}
          saturation={2}
          blend={0.47}
          falloff={1.6}
          opacity={1}
        />
      </div>
      {showFish ? (
        <>
          {live && fishArrived ? <Bubbles variant="fish" /> : null}
          <div className="app-object">
          <LiquidObject
            key={fishKey}
            ref={fishRef}
            src={MODEL_SRC}
            fallbackSrc={MODEL_FALLBACK_SRC}
            dracoDecoderPath="/draco/"
            distortion={2}
            aberration={0.75}
            grain={0}
            sheen={1.6}
            cursorSize={1}
            cursorForce={1}
            persistence={0.6}
            swirl={0.5}
            iridescence={1.5}
            splash={1.2}
            ambient={1}
            wobble={0.35}
            scale={fit.scale}
            xOffset={fit.xOffset}
            yOffset={fit.yOffset}
            cameraDistance={fit.cameraDistance}
            fov={fit.fov}
            floatIntensity={1}
            rotationIntensity={0.5}
            floatSpeed={1.5}
            orbit
            zoom={false}
            background=""
            onFetchProgress={(ratio) => {
              if (ratio <= 0) {
                setBoot((current) =>
                  current === 'live' || current === 'leaving' ? current : 'loading',
                )
                setProgress(0)
                return
              }
              setProgress(Math.round(ratio * 85))
            }}
            onDecoded={() => {
              setProgress((current) => Math.max(current, 93))
            }}
            onLoad={() => {
              setProgress(100)
              setBoot((current) => (current === 'loading' ? 'ready' : current))
            }}
            onArrive={() => setFishArrived(true)}
            onError={() => {
              setBootError(true)
            }}
          />
        </div>
        </>
      ) : null}
      {live ? (
        <button type="button" className="app-brand" onClick={() => setGiftOpen(true)}>
          {BRAND.title}
        </button>
      ) : null}
      <BgmToggle ref={bgmRef} armed={live} />
      {live ? (
        <Quiz
          onAnswer={() => fishRef.current?.react()}
          onComplete={() => fishRef.current?.startHappy()}
          onAccept={() => {
            fishRef.current?.startSwimAway(() => setShowFish(false))
          }}
        />
      ) : null}
      <SiteLayer open={giftOpen} onClose={() => setGiftOpen(false)}>
        <p className="app-quiz-q app-layer-line">
          <TrailCopy text={BRAND.gift[0]} />
        </p>
        <p className="app-quiz-q app-layer-line app-layer-line--mid">
          <TrailCopy text={BRAND.gift[1]} />
        </p>
        <p className="app-quiz-q app-layer-by">
          <TrailCopy text={BRAND.gift[2]} />
        </p>
      </SiteLayer>
      {booting ? (
        <BootScreen
          progress={progress}
          ready={boot === 'ready'}
          leaving={boot === 'leaving'}
          error={bootError}
          onEnter={handleEnter}
          onRetry={handleRetry}
        />
      ) : null}
    </div>
  )
}

export default App
