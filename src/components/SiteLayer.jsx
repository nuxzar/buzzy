import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const LEAVE_MS = 1850

export default function SiteLayer({ open, onClose, children }) {
  const [present, setPresent] = useState(open)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setPresent(true)
      setLeaving(false)
      return undefined
    }
    if (!present) return undefined
    setLeaving(true)
    const timer = window.setTimeout(() => {
      setPresent(false)
      setLeaving(false)
    }, LEAVE_MS)
    return () => window.clearTimeout(timer)
  }, [open, present])

  useEffect(() => {
    if (!present || leaving) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [present, leaving, onClose])

  if (!present || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`app-layer${leaving ? ' is-leaving' : ''}`}
      onClick={leaving ? undefined : onClose}
      role="presentation"
    >
      <button
        type="button"
        className="app-layer-close"
        aria-label="关闭"
        disabled={leaving}
        onClick={leaving ? undefined : onClose}
      >
        ×
      </button>
      <div
        className="app-layer-panel"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-layer-aura" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  )
}
