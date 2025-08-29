import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';

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

  // Swagger (optional)
  const enableSwagger = (config.get<string>('ENABLE_SWAGGER', 'false') === 'true');
  if (enableSwagger) {
    const doc = new DocumentBuilder().setTitle('Movie Mate API').setVersion('0.1.0').build();
    const document = SwaggerModule.createDocument(app, doc);
    SwaggerModule.setup('/docs', app, document);
  }

  // Sentry (minimal init)
  const dsn = config.get<string>('SENTRY_DSN', '');
  if (dsn) {
    Sentry.init({ dsn, environment: config.get('NODE_ENV') });
    process.on('uncaughtException', (e) => { try { Sentry.captureException(e); } catch {} });
    process.on('unhandledRejection', (e) => { try { Sentry.captureException(e); } catch {} });
  }

  await app.listen(port);
}

// Only run when executed directly (not under tests)
if (require.main === module) {
  // eslint-disable-next-line no-console
  bootstrap().catch((err) => console.error(err));
}

export { bootstrap };
