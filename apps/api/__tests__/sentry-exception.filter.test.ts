import 'reflect-metadata'
import { SentryExceptionFilter } from '../src/common/filters/sentry-exception.filter'
import { ArgumentsHost, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'

function createHost() {
  const resp: any = {
    code: 0,
    payload: null as any,
    headers: {} as any,
    status(code: number) {
      this.code = code
      return this
    },
    json(body: any) {
      this.payload = body
      return this
    },
    setHeader(k: string, v: string) {
      this.headers[k] = v
    },
  }
  const req: any = { traceId: 'trace-123', headers: {} }
  const host = {
    switchToHttp: () => ({ getResponse: () => resp, getRequest: () => req }),
  } as unknown as ArgumentsHost
  return { host, resp }
}

describe('SentryExceptionFilter', () => {
  it('maps 401 to GEN_UNAUTHORIZED and includes traceId', () => {
    const filter = new SentryExceptionFilter()
    const { host, resp } = createHost()
    filter.catch(new UnauthorizedException('Unauthorized'), host)
    expect(resp.code).toBe(401)
    expect(resp.payload).toHaveProperty('error', 'GEN_UNAUTHORIZED')
    expect(resp.payload).toHaveProperty('traceId', 'trace-123')
  })

  it('keeps explicit 422 GEN_VALIDATION_FAILED code', () => {
    const filter = new SentryExceptionFilter()
    const { host, resp } = createHost()
    filter.catch(
      new UnprocessableEntityException({ error: 'GEN_VALIDATION_FAILED', message: 'Invalid input' }),
      host,
    )
    expect(resp.code).toBe(422)
    expect(resp.payload).toHaveProperty('error', 'GEN_VALIDATION_FAILED')
  })

  it('maps generic error to 500 GEN_INTERNAL', () => {
    const filter = new SentryExceptionFilter()
    const { host, resp } = createHost()
    filter.catch(new Error('boom'), host)
    expect(resp.code).toBe(500)
    expect(resp.payload).toHaveProperty('error', 'GEN_INTERNAL')
  })

  it.each([
    [403, 'GEN_FORBIDDEN'],
    [404, 'GEN_NOT_FOUND'],
    [409, 'GEN_CONFLICT'],
    [429, 'GEN_RATE_LIMITED'],
  ])('maps %s to %s by default', (status, code) => {
    const filter = new SentryExceptionFilter()
    const { host, resp } = createHost()
    // Empty object to force defaultMessage/defaultCode path
    const HttpException = require('@nestjs/common').HttpException
    filter.catch(new HttpException({}, status), host)
    expect(resp.code).toBe(status)
    expect(resp.payload).toHaveProperty('error', code)
  })

  it('uses header x-trace-id if req.traceId missing', () => {
    const filter = new SentryExceptionFilter()
    const resp: any = { status: (c: number) => resp, json: (b: any) => (resp.payload = b), setHeader: jest.fn() }
    const req: any = { headers: { 'x-trace-id': 'hdr-123' } }
    const host = {
      switchToHttp: () => ({ getResponse: () => resp, getRequest: () => req }),
    } as unknown as ArgumentsHost
    filter.catch(new Error('x'), host)
    expect(resp.payload).toHaveProperty('traceId', 'hdr-123')
  })
})
