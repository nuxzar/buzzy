import { useEffect, useRef, useState } from 'react'
import { QUESTIONS } from '../data/questions'
import { INTRO, NEXT_CHAPTER } from '../data/copy'
import TrailCopy from './TrailCopy'
import AlbumHonor from './AlbumHonor'
import NameInput from './NameInput'
import Bubbles from './Bubbles'

const NEXT_MS = 980

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
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
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

  function handleStart(event) {
    if (introLeaving) return
    event.currentTarget.blur()
    setIntroLeaving(true)
    onAnswer?.()
    window.setTimeout(() => {
      setPhase('quiz')
      setIntroLeaving(false)
      setIndex(0)
      setPicked(null)
    }, NEXT_MS)
  }

  function handlePick(optionIndex, event) {
    if (picked !== null) return
    event.currentTarget.blur()
    setPicked(optionIndex)
    onAnswer?.()
  }

  function handleAccept(submitted, event) {
    const name = (typeof submitted === 'string' ? submitted : nickname).trim()
    if (!name) return
    event?.currentTarget?.blur()
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
              onClick={(event) => handlePick(optionIndex, event)}
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
            onClick={(event) => handleAccept(undefined, event)}
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
