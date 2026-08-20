/** Shared name normalize + light validation (safe for client + server). */

export const NAME_MAX_CHARS = 10

const ZERO_WIDTH =
  /[\u200B-\u200D\uFEFF\u2060\u180E\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u3164\uFFA0]/g

/** Light client-side list only — full list stays on the server. */
export const CLIENT_NAME_BLOCKLIST = [
  '操',
  '妈的',
  '傻逼',
  '煞笔',
  '草泥马',
  '尼玛',
  '他妈',
  '滚你',
  '死全家',
]

export function normalizeName(raw) {
  if (typeof raw !== 'string') return ''

  return raw
    .normalize('NFC')
    .replace(ZERO_WIDTH, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function charLength(value) {
  return Array.from(value).length
}

function isMostlySymbols(value) {
  const chars = Array.from(value)
  if (chars.length === 0) return true
  const symbolLike = chars.filter((ch) =>
    /[^\p{L}\p{N}\u4e00-\u9fff]/u.test(ch),
  ).length
  return symbolLike / chars.length >= 0.8
}

function hasObviousRepeat(value) {
  const chars = Array.from(value)
  if (chars.length < 3) return false
  if (chars.every((ch) => ch === chars[0])) return true
  if (/(.)\1{3,}/u.test(value)) return true
  return false
}

function hitsBlocklist(value, list) {
  const lower = value.toLowerCase()
  return list.some((word) => word && lower.includes(word.toLowerCase()))
}

/**
 * @returns {{ ok: true, name: string } | { ok: false, reason: 'empty' | 'too_long' | 'symbols' | 'repeat' | 'blocked' }}
 */
export function validateNameLocal(raw, blocklist = CLIENT_NAME_BLOCKLIST) {
  const name = normalizeName(raw)
  if (!name) return { ok: false, reason: 'empty' }
  if (charLength(name) > NAME_MAX_CHARS) return { ok: false, reason: 'too_long' }
  if (isMostlySymbols(name)) return { ok: false, reason: 'symbols' }
  if (hasObviousRepeat(name)) return { ok: false, reason: 'repeat' }
  if (hitsBlocklist(name, blocklist)) return { ok: false, reason: 'blocked' }
  return { ok: true, name }
}
