import { randomUUID } from 'crypto'

export function traceIdMiddleware(req: any, res: any, next: any) {
  const headerId = (req.headers['x-trace-id'] || req.headers['x-request-id']) as string | undefined
  const traceId = headerId || randomUUID()
  req.traceId = traceId
  try {
    res.setHeader('x-trace-id', traceId)
  } catch {}
  next()
}
