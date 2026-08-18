export default function TrailCopy({ text }) {
  return (
    <span className="app-quiz-stack">
      <span className="app-quiz-layer app-quiz-layer--far" aria-hidden="true">
        {text}
      </span>
      <span className="app-quiz-layer app-quiz-layer--mid" aria-hidden="true">
        {text}
      </span>
      <span className="app-quiz-layer app-quiz-layer--near" aria-hidden="true">
        {text}
      </span>
      <span className="app-quiz-layer app-quiz-layer--live">{text}</span>
    </span>
  )
}
