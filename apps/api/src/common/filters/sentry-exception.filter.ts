import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import * as Sentry from '@sentry/node'

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Report only if Sentry was initialized
    try {
      if ((Sentry as any).getCurrentHub) Sentry.captureException(exception)
    } catch {}

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest() as any

    if (response) {
      const isHttp = exception instanceof HttpException
      const status = isHttp
        ? (exception as HttpException).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

      const base = isHttp ? (exception as HttpException).getResponse() : undefined

      const details: any =
        typeof base === 'object' && base && 'details' in (base as any)
          ? (base as any).details
          : undefined
      const message: string =
        (typeof base === 'object' &&
        base &&
        (base as any).message &&
        typeof (base as any).message === 'string'
          ? (base as any).message
          : typeof base === 'string'
            ? base
            : this.defaultMessage(status)) || 'Error'

      const baseError =
        typeof base === 'object' && base && typeof (base as any).error === 'string'
          ? ((base as any).error as string)
          : undefined
      const errorCode: string =
        baseError && /^[A-Z0-9_]+$/.test(baseError) ? baseError : this.defaultCode(status)

      const traceId =
        request?.traceId || request?.headers?.['x-trace-id'] || request?.headers?.['x-request-id']
      if (traceId) {
        try {
          response.setHeader('x-trace-id', traceId)
        } catch {}
      }

      const payload = {
        statusCode: status,
        error: errorCode,
        message,
        ...(details !== undefined ? { details } : {}),
        ...(traceId ? { traceId } : {}),
      }

      return response.status(status).json(payload)
    }
  }

  private defaultCode(status: number): string {
    switch (status) {
      case 401:
        return 'GEN_UNAUTHORIZED'
      case 403:
        return 'GEN_FORBIDDEN'
      case 404:
        return 'GEN_NOT_FOUND'
      case 409:
        return 'GEN_CONFLICT'
      case 422:
        return 'GEN_VALIDATION_FAILED'
      case 429:
        return 'GEN_RATE_LIMITED'
      default:
        return 'GEN_INTERNAL'
    }
  }

  private defaultMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Unauthorized'
      case 403:
        return 'Forbidden'
      case 404:
        return 'Not Found'
      case 409:
        return 'Conflict'
      case 422:
        return 'Invalid input'
      case 429:
        return 'Too Many Requests'
      default:
        return 'Internal server error'
    }
  }
}
