import { useEffect, useMemo, useState } from 'react'
import { FlameWrap } from './canvasui/FlameWrap'
import { CERT, CERT_PASS, HONOR_PASS, HONOR_FAIL } from '../data/copy'
import TrailCopy from './TrailCopy'
import SiteLayer from './SiteLayer'
import Bubbles from './Bubbles'

const COVER_PASS_SRC = '/images/red.jpg'
const COVER_FAIL_SRC = '/images/blue.jpg'
const SEAL_SRC = '/images/seal.png'
const BLUE_FISH_SRC = '/images/blue_fish.png'
const DELUXE_SRC = '/images/deluxe.jpg'

const FLAME_PASS = {
  color: [1, 0.06, 0.02],
  intensity: 0.9,
  height: 88,
  spread: 10,
  radius: 8,
  speed: 0.32,
  scale: 0.7,
  turbulence: 0.55,
  turbulenceScale: 0.7,
  turbulenceReach: 18,
  sparks: 1.4,
  sparkSize: 0.4,
  melt: 6,
  distortion: 8,
  smoke: 1.2,
  ember: 1.6,
  rim: 2.2,
}

const FLAME_FAIL = {
  color: [0.22, 0.48, 1],
  intensity: 0.85,
  height: 88,
  spread: 10,
  radius: 8,
  speed: 0.32,
  scale: 0.7,
  turbulence: 0.55,
  turbulenceScale: 0.7,
  turbulenceReach: 18,
  sparks: 1.2,
  sparkSize: 0.4,
  melt: 6,
  distortion: 8,
  smoke: 1.0,
  ember: 1.4,
  rim: 2.0,
}

function makeCertCode() {
  return String(Math.floor(Math.random() * 100000)).padStart(5, '0')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function shareOrSave(file, filename) {
  const payload = { files: [file], title: filename }

  const canShareFiles =
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare(payload))

  if (canShareFiles) {
    try {
      await navigator.share(payload)
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

async function composeCertificate(nickname, code, coverSrc, cert, cornerSrc) {
  const [cover, corner] = await Promise.all([loadImage(coverSrc), loadImage(cornerSrc)])
  const size = cover.naturalWidth || 1080
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.drawImage(cover, 0, 0, size, size)

  const pad = size * 0.045
  const lineSize = Math.round(size * 0.027)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'top'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = size * 0.012
  ctx.font = `400 ${lineSize}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText(`${cert.idLabel} ${code}`, pad, pad)

  ctx.textAlign = 'right'
  ctx.fillText(cert.honorLine, size - pad, pad)
  ctx.font = `600 ${Math.round(size * 0.042)}px system-ui, -apple-system, sans-serif`
  ctx.fillText(nickname, size - pad, pad + lineSize * 1.35)

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  const cornerW = size * 0.4
  const cornerH = cornerW * (corner.naturalHeight / Math.max(corner.naturalWidth, 1))
  ctx.drawImage(corner, size - cornerW, size - cornerH, cornerW, cornerH)

  return canvas
}

export default function AlbumHonor({ nickname, passed = false }) {
  const honor = passed ? HONOR_PASS : HONOR_FAIL
  const cert = passed ? CERT_PASS : CERT
  const coverSrc = passed ? COVER_PASS_SRC : COVER_FAIL_SRC
  const cornerSrc = passed ? SEAL_SRC : BLUE_FISH_SRC
  const flame = passed ? FLAME_PASS : FLAME_FAIL

  const code = useMemo(() => makeCertCode(), [])
  const name = nickname.trim() || '无名'
  const [copyReady, setCopyReady] = useState(false)
  const [deluxeOpen, setDeluxeOpen] = useState(false)
  const [posterFile, setPosterFile] = useState(null)

  const posterLabel = passed ? `BUZZY-鲶鱼-典藏凭证-${name}` : `BUZZY-鲶鱼-证书-${name}`

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCopyReady(true)
      return undefined
    }
    const timer = window.setTimeout(() => setCopyReady(true), 3400)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    const filename = `${posterLabel}.png`
    composeCertificate(name, code, coverSrc, cert, cornerSrc).then(async (canvas) => {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      if (!blob || cancelled) return
      setPosterFile(new File([blob], filename, { type: 'image/png' }))
    })
    return () => {
      cancelled = true
    }
  }, [name, code, coverSrc, cert, cornerSrc, posterLabel])

  async function savePoster(event) {
    event.currentTarget.blur()
    const filename = `${posterLabel}.png`
    let file = posterFile
    if (!file) {
      const canvas = await composeCertificate(name, code, coverSrc, cert, cornerSrc)
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      if (!blob) return
      file = new File([blob], filename, { type: 'image/png' })
      setPosterFile(file)
    }
    await shareOrSave(file, filename)
  }

  return (
    <div className={`app-album${passed ? ' is-pass' : ' is-fail'}`}>
      <div
        className="app-album-art"
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.animationName !== 'album-rise') return
          setCopyReady(true)
        }}
      >
        <FlameWrap className="app-album-flame" {...flame}>
          <div className="app-cert">
            <img className="app-album-cover" src={coverSrc} alt="" draggable="false" />
            <p className="app-cert-id">
              {cert.idLabel} {code}
            </p>
            <div className="app-cert-honor">
              <p className="app-cert-honor-label">{cert.honorLine}</p>
              <p className="app-cert-honor-name">{name}</p>
            </div>
            <img className="app-cert-seal" src={cornerSrc} alt="" draggable="false" />
          </div>
        </FlameWrap>
      </div>
      <div className={`app-album-copy${copyReady ? ' is-revealed' : ''}`}>
        <Bubbles />
        <p className="app-quiz-q app-album-title">
          <TrailCopy text={honor.title} />
        </p>
        <p className="app-quiz-q app-album-sub">
          <TrailCopy text={honor.sub} />
        </p>
        <div className="app-quiz-options app-album-actions">
          {passed ? (
            <>
              <button type="button" className="app-quiz-opt" onClick={savePoster}>
                <TrailCopy text={HONOR_PASS.save} />
              </button>
              <button type="button" className="app-quiz-opt" onClick={() => setDeluxeOpen(true)}>
                <TrailCopy text={HONOR_PASS.deluxe} />
              </button>
              <button
                type="button"
                className="app-quiz-opt"
                onClick={() => window.open(HONOR_PASS.buyUrl, '_blank', 'noopener,noreferrer')}
              >
                <TrailCopy text={HONOR_PASS.buy} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="app-quiz-opt"
                onClick={() => window.open(HONOR_FAIL.albumUrl, '_blank', 'noopener,noreferrer')}
              >
                <TrailCopy text={HONOR_FAIL.review} />
              </button>
              <button type="button" className="app-quiz-opt" onClick={savePoster}>
                <TrailCopy text={HONOR_FAIL.save} />
              </button>
              <button type="button" className="app-quiz-opt" onClick={() => setDeluxeOpen(true)}>
                <TrailCopy text={HONOR_FAIL.deluxe} />
              </button>
            </>
          )}
        </div>
      </div>
      <SiteLayer open={deluxeOpen} onClose={() => setDeluxeOpen(false)}>
        <img
          className="app-layer-art"
          src={DELUXE_SRC}
          alt={honor.deluxeAlt}
          draggable="false"
        />
      </SiteLayer>
    </div>
  )
}
