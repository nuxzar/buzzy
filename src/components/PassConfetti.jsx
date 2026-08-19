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
]

function makePieces(count, wave) {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((Math.PI * 2 * index) / count) + (Math.random() - 0.5) * 0.9
    const dist = 42 + Math.random() * 58
    return {
      id: `${wave}-${index}`,
      w: 3 + Math.random() * 5,
      h: 10 + Math.random() * 22,
      color: COLORS[(index + wave) % COLORS.length],
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist * 0.92 - 8,
      rot: Math.random() * 720 - 360,
      delay: wave * 0.14 + Math.random() * 0.12,
      dur: 1.6 + Math.random() * 1.1,
      flutter: Math.random() * 40 - 20,
    }
  })
}

export default function PassConfetti({ active }) {
  const pieces = useMemo(() => [...makePieces(34, 0), ...makePieces(28, 1)], [])

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
            '--tx': `${piece.tx}%`,
            '--ty': `${piece.ty}%`,
            '--rot': `${piece.rot}deg`,
            '--flutter': `${piece.flutter}deg`,
            '--delay': `${piece.delay}s`,
            '--dur': `${piece.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
