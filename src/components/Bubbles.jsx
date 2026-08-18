const QUIZ_BUBBLES = [
  { id: 'b1', x: '10%', size: 8, dur: 7.4, delay: 0.1, drift: 8 },
  { id: 'b2', x: '22%', size: 4, dur: 5.8, delay: 1.2, drift: 6 },
  { id: 'b3', x: '38%', size: 6, dur: 8.6, delay: 0.6, drift: 10 },
  { id: 'b4', x: '54%', size: 5, dur: 6.4, delay: 2.1, drift: -4 },
  { id: 'b5', x: '71%', size: 9, dur: 9.2, delay: 0.4, drift: 8 },
  { id: 'b6', x: '84%', size: 4, dur: 5.2, delay: 1.7, drift: 12 },
  { id: 'b7', x: '93%', size: 6, dur: 7.8, delay: 2.8, drift: 6 },
]

const FISH_BUBBLES = [
  { id: 'f1', x: '12%', y: '18%', size: 28, dur: 7.8, delay: 0.1, drift: 22 },
  { id: 'f2', x: '28%', y: '6%', size: 42, dur: 6.2, delay: 1.6, drift: -18 },
  { id: 'f3', x: '41%', y: '14%', size: 22, dur: 8.4, delay: 0.7, drift: 14 },
  { id: 'f4', x: '53%', y: '4%', size: 36, dur: 5.6, delay: 2.4, drift: 26 },
  { id: 'f5', x: '67%', y: '16%', size: 48, dur: 9.1, delay: 0.3, drift: -10 },
  { id: 'f6', x: '78%', y: '8%', size: 24, dur: 6.8, delay: 1.9, drift: 16 },
  { id: 'f7', x: '19%', y: '28%', size: 18, dur: 7.2, delay: 3.1, drift: -22 },
  { id: 'f8', x: '36%', y: '2%', size: 32, dur: 8.8, delay: 1.1, drift: 8 },
  { id: 'f9', x: '61%', y: '22%', size: 20, dur: 5.9, delay: 2.8, drift: 30 },
  { id: 'f10', x: '84%', y: '10%', size: 38, dur: 7.5, delay: 0.9, drift: -14 },
  { id: 'f11', x: '8%', y: '10%', size: 26, dur: 9.6, delay: 2.2, drift: 12 },
  { id: 'f12', x: '72%', y: '1%', size: 16, dur: 6.5, delay: 3.6, drift: -8 },
]

export default function Bubbles({ variant = 'quiz' }) {
  const fish = variant === 'fish'
  const items = fish ? FISH_BUBBLES : QUIZ_BUBBLES

  return (
    <div className={fish ? 'app-fish-bubbles' : 'app-quiz-bubbles'} aria-hidden="true">
      {items.map((bubble) => (
        <span
          key={bubble.id}
          className={fish ? 'app-fish-bubble' : 'app-quiz-bubble'}
          style={{
            '--x': bubble.x,
            '--y': bubble.y,
            '--size': `${bubble.size}px`,
            '--dur': `${bubble.dur}s`,
            '--delay': `${bubble.delay}s`,
            '--drift': `${bubble.drift}px`,
          }}
        />
      ))}
    </div>
  )
}
