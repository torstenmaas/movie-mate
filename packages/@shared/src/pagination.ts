export type CursorPayload = { id: string; createdAt: string }

// base64url encode without padding
function b64url(input: string): string {
  return Buffer.from(input).toString('base64url')
}

function fromB64url(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8')
}

export function encodeCursor(payload: CursorPayload): string {
  return b64url(JSON.stringify(payload))
}

export function decodeCursor(cursor: string): CursorPayload {
  try {
    const obj = JSON.parse(fromB64url(cursor)) as any
    const id = String(obj?.id ?? '')
    const createdAt = String(obj?.createdAt ?? '')
    if (!id || !createdAt) throw new Error('missing fields')
    const d = new Date(createdAt)
    if (isNaN(d.getTime())) throw new Error('invalid date')
    return { id, createdAt: d.toISOString() }
  } catch {
    throw new Error('Invalid cursor')
  }
}

export function normalizeLimit(input: unknown, defaultLimit = 20): number {
  const n = typeof input === 'string' ? parseInt(input, 10) : (input as number)
  const v = Number.isFinite(n) ? Number(n) : defaultLimit
  if (v < 1 || v > 100) throw new RangeError('limit out of range')
  return v
}

export type PageInfo = {
  nextCursor?: string
  prevCursor?: string
  hasNextPage: boolean
  hasPrevPage: boolean
}
