const BUBBLES = [
  { id: 'b1', x: '10%', size: 8, dur: 7.4, delay: 0.1 },
  { id: 'b2', x: '22%', size: 4, dur: 5.8, delay: 1.2 },
  { id: 'b3', x: '38%', size: 6, dur: 8.6, delay: 0.6 },
  { id: 'b4', x: '54%', size: 5, dur: 6.4, delay: 2.1 },
  { id: 'b5', x: '71%', size: 9, dur: 9.2, delay: 0.4 },
  { id: 'b6', x: '84%', size: 4, dur: 5.2, delay: 1.7 },
  { id: 'b7', x: '93%', size: 6, dur: 7.8, delay: 2.8 },
]

export default function Bubbles() {
  return (
    <div className="app-quiz-bubbles" aria-hidden="true">
      {BUBBLES.map((bubble) => (
        <span
          key={bubble.id}
          className="app-quiz-bubble"
          style={{
            '--x': bubble.x,
            '--size': `${bubble.size}px`,
            '--dur': `${bubble.dur}s`,
            '--delay': `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
