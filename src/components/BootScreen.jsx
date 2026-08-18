import { BOOT } from '../data/copy'

export default function BootScreen({
  progress,
  ready,
  leaving,
  error,
  onEnter,
  onRetry,
}) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))

  return (
    <div
      className={`app-boot${ready ? ' is-ready' : ''}${leaving ? ' is-leaving' : ''}`}
    >
      <div className="app-boot-aura" aria-hidden="true" />
      <p className="app-boot-status">{error ? BOOT.fail : BOOT.status}</p>
      <p className="app-boot-pct">{error ? '—' : `${pct}%`}</p>
      {error ? (
        <button type="button" className="app-boot-enter is-ready" onClick={onRetry}>
          {BOOT.retry}
        </button>
      ) : (
        <button
          type="button"
          className={`app-boot-enter${ready ? ' is-ready' : ''}`}
          disabled={!ready}
          onClick={onEnter}
        >
          {BOOT.enter}
        </button>
      )}
    </div>
  )
}
