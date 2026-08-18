import { useEffect, useState } from 'react'
import { BOOT } from '../data/copy'

const CTA_DELAY_MS = 680

export default function BootScreen({
  progress,
  ready,
  leaving,
  error,
  onEnter,
  onRetry,
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))
  const [ctaReady, setCtaReady] = useState(false)

  useEffect(() => {
    if (error || !ready) {
      setCtaReady(false)
      return undefined
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setCtaReady(true)
      return undefined
    }
    const timer = window.setTimeout(() => setCtaReady(true), CTA_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [ready, error])

  return (
    <div
      className={`app-boot${ready ? ' is-ready' : ''}${ctaReady ? ' is-cta' : ''}${error ? ' is-error' : ''}${leaving ? ' is-leaving' : ''}`}
    >
      <div className="app-boot-aura" aria-hidden="true" />
      <div className="app-boot-stage">
        <div className="app-boot-stats">
          <p className="app-boot-status">{error ? BOOT.fail : BOOT.status}</p>
          <p className="app-boot-pct">{error ? '—' : `${pct}%`}</p>
        </div>
        {error ? (
          <button type="button" className="app-boot-enter is-ready" onClick={onRetry}>
            {BOOT.retry}
          </button>
        ) : (
          <button
            type="button"
            className={`app-boot-enter${ctaReady ? ' is-ready' : ''}`}
            disabled={!ctaReady}
            onClick={onEnter}
          >
            {BOOT.enter}
          </button>
        )}
      </div>
    </div>
  )
}
