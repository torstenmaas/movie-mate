import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Report only if Sentry was initialized
    try { if ((Sentry as any).getCurrentHub) Sentry.captureException(exception); } catch {}

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (response) {
      const isHttp = exception instanceof HttpException;
      const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const payload = isHttp ? (exception as HttpException).getResponse() : { message: 'Internal server error' };
      return response.status(status).json(payload);
    }
  }
}

