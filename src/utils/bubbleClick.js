let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  if (!audioCtx) audioCtx = new Ctx()
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playBubbleClick() {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const duration = 0.26 + Math.random() * 0.08

  const wet = ctx.createBiquadFilter()
  wet.type = 'lowpass'
  wet.frequency.setValueAtTime(420 + Math.random() * 80, now)
  wet.Q.value = 0.7

  const out = ctx.createGain()
  out.gain.setValueAtTime(0.0001, now)
  out.gain.exponentialRampToValueAtTime(0.32, now + 0.018)
  out.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  wet.connect(out)
  out.connect(ctx.destination)

  const base = 62 + Math.random() * 28
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base * 1.75, now)
  osc.frequency.exponentialRampToValueAtTime(base * 0.5, now + duration * 0.9)

  const oscGain = ctx.createGain()
  oscGain.gain.value = 0.5
  osc.connect(oscGain)
  oscGain.connect(wet)

  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i += 1) {
    const env = 1 - i / bufferSize
    data[i] = (Math.random() * 2 - 1) * env * env
  }

  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 150 + Math.random() * 70
  noiseFilter.Q.value = 1.4

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.38
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(wet)

  osc.start(now)
  osc.stop(now + duration + 0.02)
  noise.start(now)
  noise.stop(now + duration + 0.02)
}

export function bindBubbleClickSounds() {
  const onPointerDown = (event) => {
    const button = event.target.closest('button')
    if (!button || button.disabled) return
    playBubbleClick()
  }

  document.addEventListener('pointerdown', onPointerDown, { capture: true })
  return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true })
}
