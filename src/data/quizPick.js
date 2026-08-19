import { QUESTION_BANK } from './questions'

const QUIZ_LENGTH = 10

export function pickQuizSet(count = QUIZ_LENGTH) {
  const pool = [...QUESTION_BANK]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

export { QUIZ_LENGTH }
