import { useEffect, useMemo, useState } from 'react'
import { FlameWrap } from './canvasui/FlameWrap'
import { CERT, HONOR } from '../data/copy'
import TrailCopy from './TrailCopy'
import SiteLayer from './SiteLayer'

const COVER_SRC = '/images/cover.jpg'
const SEAL_SRC = '/images/seal.png'

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

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCopyReady(true)
      return undefined
    }
    const timer = window.setTimeout(() => setCopyReady(true), 3400)
    return () => window.clearTimeout(timer)
  }, [])

  async function savePoster() {
    const canvas = await composeCertificate(name, code)
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BUZZY-鲶鱼-证书-${name}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
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
        <p className="app-quiz-q app-layer-line">
          <TrailCopy text={HONOR.deluxeSoon} />
        </p>
      </SiteLayer>
    </div>
  )
}
