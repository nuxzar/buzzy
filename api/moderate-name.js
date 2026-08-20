import { createHash } from 'node:crypto'
import tencentcloud from 'tencentcloud-sdk-nodejs-tms'
import {
  CLIENT_NAME_BLOCKLIST,
  normalizeName,
  validateNameLocal,
} from '../src/utils/nameSafety.js'

const TmsClient = tencentcloud.tms.v20201229.Client

/** Server-only extras — keep full libraries here, not in the client bundle. */
const SERVER_NAME_BLOCKLIST = [
  ...CLIENT_NAME_BLOCKLIST,
  '法西斯',
  '纳粹',
  'isis',
  '色情',
  '黄赌毒',
  '赌博',
  '毒品',
]

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const TMS_TIMEOUT_MS = 8_000

/** @type {Map<string, number[]>} */
const rateBuckets = new Map()

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function rateLimited(ip) {
  const now = Date.now()
  const prev = rateBuckets.get(ip) || []
  const recent = prev.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, recent)
    return true
  }
  recent.push(now)
  rateBuckets.set(ip, recent)
  return false
}

function fingerprint(name) {
  return createHash('sha256').update(name).digest('hex').slice(0, 12)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body)
      return
    }

    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 4096) {
        reject(new Error('body_too_large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

async function callTms(name) {
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const bizType = process.env.TENCENT_TMS_BIZ_TYPE
  const region = process.env.TENCENT_TMS_REGION || 'ap-guangzhou'

  if (!secretId || !secretKey || !bizType) {
    const err = new Error('tms_not_configured')
    err.code = 'tms_not_configured'
    throw err
  }

  const client = new TmsClient({
    credential: { secretId, secretKey },
    region,
    profile: {
      httpProfile: {
        reqMethod: 'POST',
        reqTimeout: Math.ceil(TMS_TIMEOUT_MS / 1000),
      },
    },
  })

  const content = Buffer.from(name, 'utf8').toString('base64')
  return client.TextModeration({
    Content: content,
    BizType: bizType,
  })
}

function tmsAllows(result) {
  const suggestion = String(result?.Suggestion || '').toLowerCase()
  // Pass only. Block / Review / anything else → reject (fail closed for nicknames).
  return suggestion === 'pass'
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    send(res, 405, { ok: false, reason: 'method_not_allowed' })
    return
  }

  const ip = clientIp(req)
  if (rateLimited(ip)) {
    console.info('[moderate-name]', { outcome: 'rate_limited' })
    send(res, 429, { ok: false, reason: 'rate_limited' })
    return
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    send(res, 400, { ok: false, reason: 'bad_request' })
    return
  }

  const local = validateNameLocal(body?.name, SERVER_NAME_BLOCKLIST)
  if (!local.ok) {
    console.info('[moderate-name]', { outcome: 'local_reject', reason: local.reason })
    send(res, 200, { ok: false, reason: local.reason === 'blocked' ? 'rejected' : local.reason })
    return
  }

  const name = normalizeName(local.name)
  const fp = fingerprint(name)

  try {
    const result = await Promise.race([
      callTms(name),
      new Promise((_, reject) => {
        const timer = setTimeout(() => {
          const err = new Error('tms_timeout')
          err.code = 'tms_timeout'
          reject(err)
        }, TMS_TIMEOUT_MS)
        // Unref if available so cold starts aren't held open oddly
        timer.unref?.()
      }),
    ])

    if (!tmsAllows(result)) {
      console.info('[moderate-name]', {
        outcome: 'tms_reject',
        fp,
        suggestion: result?.Suggestion || null,
      })
      send(res, 200, { ok: false, reason: 'rejected' })
      return
    }

    console.info('[moderate-name]', { outcome: 'allow', fp })
    send(res, 200, { ok: true, name })
  } catch (error) {
    const code = error?.code || error?.message || 'tms_error'
    console.error('[moderate-name]', { outcome: 'error', code: String(code).slice(0, 64) })
    send(res, 503, { ok: false, reason: 'unavailable' })
  }
}
