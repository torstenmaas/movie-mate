import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Config
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const origins = (config.get<string[]>('CORS_ORIGINS', []) || []) as string[];

  // CORS
  const allow = new Set(origins);
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true);
      if (allow.has(origin)) return cb(null, true);
      return cb(new Error('CORS not allowed'), false);
    },
    credentials: true,
  });

  // Logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(port);
}

// Only run when executed directly (not under tests)
if (require.main === module) {
  // eslint-disable-next-line no-console
  bootstrap().catch((err) => console.error(err));
}

export { bootstrap };
