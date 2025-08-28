import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: process.env.APP_NAME ? `${process.env.APP_NAME}@${process.env.NODE_ENV ?? 'dev'}` : 'movie-mate',
    };
  }
}

