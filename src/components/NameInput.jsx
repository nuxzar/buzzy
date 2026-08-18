import { useRef, useState } from 'react'

const MAX_CHARS = 10

function charCount(value) {
  return Array.from(value).length
}

function limitChars(value) {
  return Array.from(value).slice(0, MAX_CHARS).join('')
}

export default function NameInput({ value, onChange, onSubmit, disabled }) {
  const composingRef = useRef(false)
  const committedRef = useRef(value)
  const [composing, setComposing] = useState(false)

  const counted = composing ? charCount(committedRef.current) : charCount(value)

  function commit(next) {
    const limited = limitChars(next)
    committedRef.current = limited
    onChange(limited)
  }

  function handleChange(event) {
    const next = event.target.value
    if (composingRef.current) {
      onChange(next)
      return
    }
    commit(next)
  }

  function handleCompositionStart() {
    composingRef.current = true
    committedRef.current = limitChars(value)
    setComposing(true)
  }

  function handleCompositionEnd(event) {
    composingRef.current = false
    setComposing(false)
    commit(event.currentTarget.value)
  }

  function handleBlur(event) {
    composingRef.current = false
    setComposing(false)
    commit(event.currentTarget.value)
  }

  return (
    <div className="app-quiz-name-wrap">
      <input
        className="app-quiz-name"
        type="text"
        value={value}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        aria-label="昵称"
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || composingRef.current) return
          event.preventDefault()
          const limited = limitChars(event.currentTarget.value)
          commit(limited)
          onSubmit?.(limited)
        }}
      />
      <p className="app-quiz-name-count">{counted}/{MAX_CHARS}</p>
    </div>
  )
}
