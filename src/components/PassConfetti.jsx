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

function makePiece(wave) {
  const angle = Math.random() * Math.PI * 2
  const dist = 125 + Math.random() ** 0.45 * 215

  const bx = Math.cos(angle) * dist
  const by = Math.sin(angle) * dist - (8 + Math.random() * 28)
  const drop = 42 + Math.random() ** 0.8 * 95
  const fx = bx + (Math.random() - 0.5) * 36
  const fy = by + drop

  const ribbon = Math.random() > 0.42
  const w = ribbon ? 4 + Math.random() * 10 : 2 + Math.random() * 5
  const h = ribbon ? 8 + Math.random() * 18 : 16 + Math.random() * 42

  return {
    w,
    h,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    fx,
    fy,
    spin: Math.random() * 900 - 450,
    delay: wave === 0 ? Math.random() * 0.05 : 0.04 + Math.random() * 0.07,
    dur: 0.72 + Math.random() * 0.48,
  }
}

function makeBurst(total, sparkTotal) {
  return [
    ...Array.from({ length: total }, (_, index) => ({
      id: `core-${index}`,
      ...makePiece(0),
    })),
    ...Array.from({ length: sparkTotal }, (_, index) => ({
      id: `spark-${index}`,
      ...makePiece(1),
    })),
  ]
}

export default function PassConfetti({ active }) {
  const pieces = useMemo(() => makeBurst(120, 36), [])

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
            '--fx': `${piece.fx}px`,
            '--fy': `${piece.fy}px`,
            '--spin': `${piece.spin}deg`,
            '--delay': `${piece.delay}s`,
            '--dur': `${piece.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
