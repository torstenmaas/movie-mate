import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import * as Sentry from '@sentry/node'
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter'
import { randomUUID } from 'crypto'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Config
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3000)
  const origins = (config.get<string[]>('CORS_ORIGINS', []) || []) as string[]

  // CORS
  const allow = new Set(origins)
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true)
      if (allow.has(origin)) return cb(null, true)
      return cb(new Error('CORS not allowed'), false)
    },
    credentials: true,
  })

  // Swagger (optional)
  const enableSwagger = config.get<string>('ENABLE_SWAGGER', 'false') === 'true'
  if (enableSwagger) {
    const doc = new DocumentBuilder()
      .setTitle('Movie Mate API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, doc)
    SwaggerModule.setup('/docs', app, document)
  }

  // Attach a simple traceId to each request and response
  app.use((req: any, res: any, next: any) => {
    const headerId = (req.headers['x-trace-id'] || req.headers['x-request-id']) as
      | string
      | undefined
    const traceId = headerId || randomUUID()
    req.traceId = traceId
    res.setHeader('x-trace-id', traceId)
    next()
  })

  // Cookies for refresh flow (optional)
  if (config.get<string>('REFRESH_TOKEN_COOKIE') === 'true') {
    app.use(cookieParser())
  }

  // Sentry (minimal init)
  const dsn = config.get<string>('SENTRY_DSN', '')
  if (dsn) {
    Sentry.init({ dsn, environment: config.get('NODE_ENV') })
    process.on('uncaughtException', (e) => {
      try {
        Sentry.captureException(e)
      } catch {}
    })
    process.on('unhandledRejection', (e) => {
      try {
        Sentry.captureException(e)
      } catch {}
    })
  }

  // Global error filter (includes Sentry capture when initialized)
  app.useGlobalFilters(new SentryExceptionFilter())

  await app.listen(port)
}

// Only run when executed directly (not under tests)
if (require.main === module) {
  // eslint-disable-next-line no-console
  bootstrap().catch((err) => console.error(err))
}

export { bootstrap }
