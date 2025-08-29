import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req?.method;
    const url = req?.originalUrl || req?.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const status = res?.statusCode;
          this.logger.log(JSON.stringify({ method, url, status, durationMs: Date.now() - now }));
        },
        error: (err) => {
          const res = context.switchToHttp().getResponse();
          const status = res?.statusCode ?? 500;
          this.logger.error(JSON.stringify({ method, url, status, durationMs: Date.now() - now, error: err?.message }));
        },
      }),
    );
  }
}

