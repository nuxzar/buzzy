import { useEffect, useImperativeHandle, useRef, useState } from 'react'

const BGM_SRC = '/audio/bgm.mp3'
const BGM_VOLUME = 0.5
const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'click', 'keydown']

export default function BgmToggle({ armed = false, ref }) {
  const audioRef = useRef(null)
  const wantOnRef = useRef(true)
  const [on, setOn] = useState(true)

  useImperativeHandle(ref, () => ({
    playFromGesture() {
      wantOnRef.current = true
      setOn(true)
      const audio = audioRef.current
      if (!audio) return
      audio.muted = false
      audio.volume = BGM_VOLUME
      audio.play().catch(() => {})
    },
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    audio.loop = true
    audio.muted = false
    audio.volume = BGM_VOLUME

    if (!armed) {
      audio.pause()
      return undefined
    }

    const tryPlay = () => {
      if (!wantOnRef.current) return
      audio.play().catch(() => {})
    }

    tryPlay()
    audio.addEventListener('canplay', tryPlay)
    document.addEventListener('WeixinJSBridgeReady', tryPlay)

    const unlock = () => tryPlay()
    for (const type of UNLOCK_EVENTS) {
      window.addEventListener(type, unlock, { capture: true })
    }

    const onVisible = () => {
      if (!document.hidden) tryPlay()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      audio.removeEventListener('canplay', tryPlay)
      document.removeEventListener('WeixinJSBridgeReady', tryPlay)
      document.removeEventListener('visibilitychange', onVisible)
      for (const type of UNLOCK_EVENTS) {
        window.removeEventListener(type, unlock, { capture: true })
      }
    }
  }, [armed])

  function toggle() {
    const audio = audioRef.current
    const next = !wantOnRef.current
    wantOnRef.current = next
    setOn(next)
    if (!audio) return
    if (next) {
      audio.muted = false
      audio.volume = BGM_VOLUME
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }

  return (
    <>
      <audio ref={audioRef} src={BGM_SRC} loop playsInline preload="auto" />
      {armed ? (
        <button
          type="button"
          className={`app-bgm${on ? ' is-on' : ''}`}
          aria-label={on ? '关闭背景音乐' : '打开背景音乐'}
          aria-pressed={on}
          onClick={toggle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9.2 4.4v10.2a3.4 3.4 0 1 0 1.7 2.9V8.6l8.2-1.6v7.4a3.4 3.4 0 1 0 1.7 2.9V3.2L9.2 4.4Z"
            />
            {!on ? (
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="M4.2 19.6 19.8 4.4"
              />
            ) : null}
          </svg>
        </button>
      ) : null}
    </>
  )
}
