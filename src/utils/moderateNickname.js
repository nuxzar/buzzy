import { validateNameLocal } from './nameSafety'
import { NAME_MODERATION } from '../data/copy'

const MODERATE_URL = '/api/moderate-name'
const FETCH_TIMEOUT_MS = 10_000

export function messageForModerationReason(reason) {
  return NAME_MODERATION[reason] || NAME_MODERATION.unavailable
}

/**
 * Local checks first, then POST to server TMS gate.
 * Fail-closed: network/API errors never allow through.
 * @returns {Promise<{ ok: true, name: string } | { ok: false, reason: string }>}
 */
export async function moderateNickname(raw) {
  const local = validateNameLocal(raw)
  if (!local.ok) return local

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(MODERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: local.name }),
      signal: controller.signal,
    })

    let data = null
    try {
      data = await response.json()
    } catch {
      return { ok: false, reason: 'unavailable' }
    }

    if (response.status === 429) {
      return { ok: false, reason: 'rate_limited' }
    }

    if (!response.ok) {
      return { ok: false, reason: data?.reason || 'unavailable' }
    }

    if (data?.ok === true && typeof data.name === 'string' && data.name) {
      return { ok: true, name: data.name }
    }

    return { ok: false, reason: data?.reason || 'rejected' }
  } catch {
    return { ok: false, reason: 'unavailable' }
  } finally {
    window.clearTimeout(timer)
  }
}
