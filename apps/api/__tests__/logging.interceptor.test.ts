import 'reflect-metadata'
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor'
import { of, throwError } from 'rxjs'

function mockCtx(status?: number) {
  const res: any = { statusCode: status }
  const req: any = { method: 'GET', url: '/x', originalUrl: '/x' }
  return {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
  } as any
}

describe('LoggingInterceptor', () => {
  it('logs on success', (done) => {
    const interceptor = new LoggingInterceptor() as any
    const spy = jest.spyOn((interceptor as any).logger, 'log').mockImplementation(() => undefined)
    const next = { handle: () => of({ ok: true }) }
    interceptor.intercept(mockCtx(200) as any, next as any).subscribe({
      next: () => {
        expect(spy).toHaveBeenCalled()
        done()
      },
      error: done,
    })
  })

  it('logs error with status fallback', (done) => {
    const interceptor = new LoggingInterceptor() as any
    const spy = jest.spyOn((interceptor as any).logger, 'error').mockImplementation(() => undefined)
    const next = { handle: () => throwError(() => new Error('boom')) }
    interceptor.intercept(mockCtx(undefined) as any, next as any).subscribe({
      next: () => done('expected error'),
      error: () => {
        expect(spy).toHaveBeenCalled()
        done()
      },
    })
  })
})
