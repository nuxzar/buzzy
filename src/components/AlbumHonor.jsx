import { useEffect, useMemo, useState } from 'react'
import { FlameWrap } from './canvasui/FlameWrap'
import { CERT, HONOR } from '../data/copy'
import TrailCopy from './TrailCopy'
import SiteLayer from './SiteLayer'
import Bubbles from './Bubbles'

const COVER_SRC = '/images/cover.jpg'
const SEAL_SRC = '/images/seal.png'
const DELUXE_SRC = '/images/deluxe.jpg'

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

async function composeCertificate(nickname, code) {
  const [cover, seal] = await Promise.all([
    loadImage(COVER_SRC),
    loadImage(SEAL_SRC),
  ])
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
  ctx.fillText(`${CERT.idLabel} ${code}`, pad, pad)

  ctx.textAlign = 'right'
  ctx.fillText(CERT.honorLine, size - pad, pad)
  ctx.font = `600 ${Math.round(size * 0.042)}px system-ui, -apple-system, sans-serif`
  ctx.fillText(nickname, size - pad, pad + lineSize * 1.35)

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  const sealW = size * 0.4
  const sealH = sealW * (seal.naturalHeight / Math.max(seal.naturalWidth, 1))
  ctx.drawImage(seal, size - sealW, size - sealH, sealW, sealH)

  return canvas
}

export default function AlbumHonor({ nickname }) {
  const code = useMemo(() => makeCertCode(), [])
  const name = nickname.trim() || '无名'
  const [copyReady, setCopyReady] = useState(false)
  const [deluxeOpen, setDeluxeOpen] = useState(false)
  const [posterFile, setPosterFile] = useState(null)

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
    const filename = `BUZZY-鲶鱼-证书-${name}.png`
    composeCertificate(name, code).then(async (canvas) => {
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
      if (!blob || cancelled) return
      setPosterFile(new File([blob], filename, { type: 'image/png' }))
    })
    return () => {
      cancelled = true
    }
  }, [name, code])

  async function savePoster(event) {
    event.currentTarget.blur()
    const filename = `BUZZY-鲶鱼-证书-${name}.png`
    let file = posterFile
    if (!file) {
      const canvas = await composeCertificate(name, code)
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
    <div className="app-album">
      <div
        className="app-album-art"
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.animationName !== 'album-rise') return
          setCopyReady(true)
        }}
      >
        <FlameWrap
          className="app-album-flame"
          color={[1, 0.06, 0.02]}
          intensity={0.9}
          height={88}
          spread={10}
          radius={8}
          speed={0.32}
          scale={0.7}
          turbulence={0.55}
          turbulenceScale={0.7}
          turbulenceReach={18}
          sparks={1.4}
          sparkSize={0.4}
          melt={6}
          distortion={8}
          smoke={1.2}
          ember={1.6}
          rim={2.2}
        >
          <div className="app-cert">
            <img className="app-album-cover" src={COVER_SRC} alt="" draggable="false" />
            <p className="app-cert-id">
              {CERT.idLabel} {code}
            </p>
            <div className="app-cert-honor">
              <p className="app-cert-honor-label">{CERT.honorLine}</p>
              <p className="app-cert-honor-name">{name}</p>
            </div>
            <img className="app-cert-seal" src={SEAL_SRC} alt="" draggable="false" />
          </div>
        </FlameWrap>
      </div>
      <div className={`app-album-copy${copyReady ? ' is-revealed' : ''}`}>
        <Bubbles />
        <p className="app-quiz-q app-album-title">
          <TrailCopy text={HONOR.title} />
        </p>
        <p className="app-quiz-q app-album-sub">
          <TrailCopy text={HONOR.sub} />
        </p>
        <div className="app-quiz-options app-album-actions">
          <button
            type="button"
            className="app-quiz-opt"
            onClick={() => window.open(HONOR.albumUrl, '_blank', 'noopener,noreferrer')}
          >
            <TrailCopy text={HONOR.review} />
          </button>
          <button type="button" className="app-quiz-opt" onClick={savePoster}>
            <TrailCopy text={HONOR.save} />
          </button>
          <button type="button" className="app-quiz-opt" onClick={() => setDeluxeOpen(true)}>
            <TrailCopy text={HONOR.deluxe} />
          </button>
        </div>
      </div>
      <SiteLayer open={deluxeOpen} onClose={() => setDeluxeOpen(false)}>
        <img
          className="app-layer-art"
          src={DELUXE_SRC}
          alt={HONOR.deluxeAlt}
          draggable="false"
        />
      </SiteLayer>
    </div>
  )
}
