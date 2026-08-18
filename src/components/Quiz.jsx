import { useEffect, useRef, useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { INTRO, NEXT_CHAPTER } from '../data/copy'
import TrailCopy from './TrailCopy'
import AlbumHonor from './AlbumHonor'
import NameInput from './NameInput'

const NEXT_MS = 980

const BUBBLES = [
  { id: 'b1', x: '10%', size: 8, dur: 7.4, delay: 0.1 },
  { id: 'b2', x: '22%', size: 4, dur: 5.8, delay: 1.2 },
  { id: 'b3', x: '38%', size: 6, dur: 8.6, delay: 0.6 },
  { id: 'b4', x: '54%', size: 5, dur: 6.4, delay: 2.1 },
  { id: 'b5', x: '71%', size: 9, dur: 9.2, delay: 0.4 },
  { id: 'b6', x: '84%', size: 4, dur: 5.2, delay: 1.7 },
  { id: 'b7', x: '93%', size: 6, dur: 7.8, delay: 2.8 },
]

function Bubbles() {
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

export default function Quiz({ onAnswer, onComplete, onAccept }) {
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)
  const [introLeaving, setIntroLeaving] = useState(false)
  const [verdictLeaving, setVerdictLeaving] = useState(false)
  const [nickname, setNickname] = useState('')
  const [kbLift, setKbLift] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const question = QUESTIONS[index]
  const quizLeaving = phase === 'quiz' && picked !== null
  const leaving = introLeaving || quizLeaving || verdictLeaving

  useEffect(() => {
    if (phase !== 'quiz' || picked === null) return undefined

    const timer = window.setTimeout(() => {
      if (index >= QUESTIONS.length - 1) {
        setPhase('happy')
        setPicked(null)
        onCompleteRef.current?.()
        return
      }

      setIndex((current) => current + 1)
      setPicked(null)
    }, NEXT_MS)

    return () => window.clearTimeout(timer)
  }, [phase, picked, index])

  useEffect(() => {
    if (phase !== 'happy') return undefined

    const timer = window.setTimeout(() => {
      setPhase('verdict')
    }, 2600)

    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'verdict') {
      setKbLift(0)
      return undefined
    }

    const viewport = window.visualViewport
    if (!viewport) return undefined

    const update = () => {
      const occluded = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setKbLift(occluded)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [phase])

  function handleStart() {
    if (introLeaving) return
    setIntroLeaving(true)
    onAnswer?.()
    window.setTimeout(() => {
      setPhase('quiz')
      setIntroLeaving(false)
      setIndex(0)
      setPicked(null)
    }, NEXT_MS)
  }

  function handlePick(optionIndex) {
    if (picked !== null) return
    setPicked(optionIndex)
    onAnswer?.()
  }

  function handleAccept(submitted) {
    const name = (typeof submitted === 'string' ? submitted : nickname).trim()
    if (!name) return
    setNickname(name)
    onAccept?.()
    setPhase('chapter')
  }

  let panel = null

  if (phase === 'intro') {
    panel = (
      <div className="app-quiz-panel" key="intro">
        <div className="app-quiz-aura" aria-hidden="true" />
        <Bubbles />
        <p className="app-quiz-q app-quiz-intro-lead">
          <TrailCopy text={INTRO.lead} />
        </p>
        <p className="app-quiz-q app-quiz-intro-ask">
          <TrailCopy text={INTRO.ask} />
        </p>
        <div className="app-quiz-options">
          <button
            type="button"
            className={`app-quiz-opt app-quiz-intro-cta${introLeaving ? ' is-picked' : ''}`}
            disabled={introLeaving}
            onClick={handleStart}
          >
            <TrailCopy text={INTRO.cta} />
          </button>
        </div>
      </div>
    )
  } else if (phase === 'quiz' && question) {
    panel = (
      <div className="app-quiz-panel" key={question.id}>
        <div className="app-quiz-aura" aria-hidden="true" />
        <Bubbles />
        <p className="app-quiz-q">
          <TrailCopy text={question.text} />
        </p>
        <div className="app-quiz-options">
          {question.options.slice(0, 3).map((label, optionIndex) => (
            <button
              key={`${question.id}-${optionIndex}`}
              type="button"
              className={`app-quiz-opt${picked === optionIndex ? ' is-picked' : ''}`}
              disabled={quizLeaving}
              onClick={() => handlePick(optionIndex)}
            >
              <TrailCopy text={label} />
            </button>
          ))}
        </div>
      </div>
    )
  } else if (phase === 'verdict') {
    panel = (
      <div className="app-quiz-panel" key="verdict">
        <div className="app-quiz-aura" aria-hidden="true" />
        <Bubbles />
        <p className="app-quiz-q app-quiz-intro-lead">
          <TrailCopy text={NEXT_CHAPTER.lead} />
        </p>
        <p className="app-quiz-q app-quiz-intro-ask">
          <TrailCopy text={NEXT_CHAPTER.ask} />
        </p>
        <NameInput
          value={nickname}
          onChange={setNickname}
          disabled={verdictLeaving}
          onSubmit={handleAccept}
        />
        <div className="app-quiz-options">
          <button
            type="button"
            className={`app-quiz-opt app-quiz-intro-cta${verdictLeaving ? ' is-picked' : ''}`}
            disabled={verdictLeaving || !nickname.trim()}
            onClick={() => handleAccept()}
          >
            <TrailCopy text={NEXT_CHAPTER.cta} />
          </button>
        </div>
      </div>
    )
  } else if (phase === 'chapter') {
    panel = <AlbumHonor nickname={nickname} />
  }

  return (
    <div
      className={`app-quiz${leaving ? ' is-leaving' : ''}${phase === 'intro' ? ' is-intro' : ''}${phase === 'verdict' ? ' is-verdict' : ''}${phase === 'chapter' ? ' is-chapter' : ''}`}
      style={kbLift ? { transform: `translate3d(0, ${-kbLift}px, 0)` } : undefined}
    >
      {panel}
    </div>
  )
}
