import { useMemo } from 'react'

const COLORS = [
  '#fff6e8',
  '#f3e2c4',
  '#e8c992',
  '#d4af37',
  '#c41e3a',
  '#8b1a1a',
  '#ffd666',
  '#f8f0e3',
  '#ffe8cc',
  '#b8860b',
]

const EASE = [
  'cubic-bezier(0.04, 0.92, 0.12, 1)',
  'cubic-bezier(0.14, 0.78, 0.22, 1)',
  'cubic-bezier(0.22, 0.62, 0.32, 1)',
]

function makePieces(count, wave) {
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.random() * Math.PI * 2
    const power = 0.55 + Math.random() ** 0.7 * 0.65
    const dist = (95 + Math.random() * 175) * power

    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist * 0.82 - (22 + Math.random() * 42)

    const overshoot = 1.06 + Math.random() * 0.22
    const peakTx = tx * overshoot + (Math.random() - 0.5) * 18
    const peakTy = ty * overshoot - (10 + Math.random() * 24)

    const sway = (Math.random() - 0.5) * 64
    const fall = 34 + Math.random() ** 0.85 * 88
    const finalTx = tx + sway
    const finalTy = ty + fall
    const driftTx = tx + sway * 0.55
    const driftTy = ty + (finalTy - ty) * 0.42

    const ribbon = Math.random() > 0.48
    const w = ribbon ? 4 + Math.random() * 9 : 2 + Math.random() * 4.5
    const h = ribbon ? 7 + Math.random() * 16 : 14 + Math.random() * 38

    const variant = index % 3

    return {
      id: `${wave}-${index}`,
      w,
      h,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      peakTx,
      peakTy,
      tx,
      ty,
      driftTx,
      driftTy,
      finalTx,
      finalTy,
      rotMid: Math.random() * 420 - 210,
      rotEnd: Math.random() * 960 - 480,
      delay: wave * 0.13 + Math.random() ** 1.4 * 0.28,
      dur:
        variant === 0
          ? 1.05 + Math.random() * 0.55
          : variant === 1
            ? 1.35 + Math.random() * 0.75
            : 1.75 + Math.random() * 0.95,
      ease: EASE[variant],
      wobble: (Math.random() - 0.5) * 28,
    }
  })
}

export default function PassConfetti({ active }) {
  const pieces = useMemo(
    () => [
      ...makePieces(52, 0),
      ...makePieces(46, 1),
      ...makePieces(42, 2),
      ...makePieces(38, 3),
    ],
    [],
  )

  if (!active) return null

  return (
    <div className="app-pass-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="app-pass-confetti-piece"
          style={{
            '--w': `${piece.w}px`,
            '--h': `${piece.h}px`,
            '--c': piece.color,
            '--peak-x': `${piece.peakTx}px`,
            '--peak-y': `${piece.peakTy}px`,
            '--tx': `${piece.tx}px`,
            '--ty': `${piece.ty}px`,
            '--drift-x': `${piece.driftTx}px`,
            '--drift-y': `${piece.driftTy}px`,
            '--final-x': `${piece.finalTx}px`,
            '--final-y': `${piece.finalTy}px`,
            '--wobble': `${piece.wobble}px`,
            '--rot-mid': `${piece.rotMid}deg`,
            '--rot-end': `${piece.rotEnd}deg`,
            '--delay': `${piece.delay}s`,
            '--dur': `${piece.dur}s`,
            '--ease': piece.ease,
          }}
        />
      ))}
    </div>
  )
}
