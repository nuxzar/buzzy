import { QUESTION_BANK } from './questions'

const QUIZ_LENGTH = 10
const MAX_ANSWER_SLOT = 5

function shuffleArray(items) {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

/** 混排选项，同步更新 answer 下标 */
export function shuffleQuestionOptions(question) {
  const correctText = question.options[question.answer]
  const options = shuffleArray(question.options)
  return {
    ...question,
    options,
    answer: options.indexOf(correctText),
  }
}

function countAnswerSlots(questions) {
  const counts = [0, 0, 0]
  for (const question of questions) {
    counts[question.answer] += 1
  }
  return counts
}

function balanceAnswerSlots(questions) {
  let picked = questions.map(shuffleQuestionOptions)

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const counts = countAnswerSlots(picked)
    const overloaded = counts.findIndex((count) => count > MAX_ANSWER_SLOT)
    if (overloaded === -1) return picked

    picked = picked.map((question) =>
      question.answer === overloaded ? shuffleQuestionOptions(question) : question,
    )
  }

  return picked
}

export function pickQuizSet(count = QUIZ_LENGTH) {
  const pool = shuffleArray(QUESTION_BANK)
  const selected = pool.slice(0, Math.min(count, pool.length))
  return balanceAnswerSlots(selected)
}

export { QUIZ_LENGTH }
