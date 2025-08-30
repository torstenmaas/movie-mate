import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { INestApplication } from '@nestjs/common'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import * as Sentry from '@sentry/node'
import helmet from 'helmet'
import express from 'express'
import { ExpressAdapter } from '@nestjs/platform-express'

async function bootstrap() {
  // Pre-create Express app to attach Sentry handlers before Nest
  const expressApp = express()

  // Temporarily bootstrap a lightweight Nest app just to get ConfigService
  // We will re-create the app on the Express adapter below
  const tempApp = await NestFactory.create(AppModule, { logger: false })
  const config = tempApp.get(ConfigService)
  await tempApp.close()

  // Config values
  const port = config.get<number>('PORT', 3000)
  const origins = (config.get<string[]>('CORS_ORIGINS', []) || []) as string[]
  const nodeEnv = config.get<string>('NODE_ENV', 'development')
  const dsn = config.get<string>('SENTRY_DSN', '')
  const tracesSampleRate = parseFloat(config.get<string>('SENTRY_TRACES_SAMPLE_RATE', '0.1') || '0')
  const profilesSampleRate = parseFloat(
    config.get<string>('SENTRY_PROFILES_SAMPLE_RATE', '0') || '0',
  )
  const verifySetup = config.get<string>('SENTRY_VERIFY_SETUP', 'false') === 'true'
  const imageCommit = (config.get<string>('IMAGE_COMMIT', '') || '').trim()
  const release = imageCommit ? imageCommit.substring(0, 7) : undefined

  // Sentry init (only if DSN present)
  if (dsn) {
    Sentry.init({
      dsn,
      environment: nodeEnv,
      release,
      tracesSampleRate: isFinite(tracesSampleRate) ? tracesSampleRate : 0,
      profilesSampleRate: isFinite(profilesSampleRate) ? profilesSampleRate : 0,
      integrations: [Sentry.expressIntegration()],
      beforeSend(event) {
        const url = event.request?.url || ''
        if (url.includes('/api/v1/health')) return null
        if (url.includes('/api/v1/docs')) return null
        return event
      },
      beforeSendTransaction(event) {
        const url = event.request?.url || ''
        if (url.includes('/api/v1/health')) return null
        if (url.includes('/api/v1/docs')) return null
        return event
      },
    })
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
  // API versioned prefix
  app.setGlobalPrefix('api/v1')

  // CORS
  const allow = new Set(origins)
  // Security headers
  const enableSwagger = config.get<string>('ENABLE_SWAGGER', 'false') === 'true'
  app.use(
    helmet({
      contentSecurityPolicy: enableSwagger ? false : undefined,
      crossOriginEmbedderPolicy: enableSwagger ? false : undefined,
    }),
  )
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return cb(null, true)
      if (allow.has(origin)) return cb(null, true)
      return cb(new Error('CORS not allowed'), false)
    },
    credentials: true,
  })

  // Swagger (optional)
  if (enableSwagger) {
    const doc = new DocumentBuilder()
      .setTitle('Movie Mate API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, doc)
    SwaggerModule.setup('/api/v1/docs', app, document)
  }

  // traceId is managed via traceIdMiddleware in AppModule

  // Cookies for refresh flow (optional)
  if (config.get<string>('REFRESH_TOKEN_COOKIE') === 'true') {
    app.use(cookieParser())
  }

  // Sentry error handler AFTER app setup
  if (dsn) {
    Sentry.setupExpressErrorHandler(expressApp)
  }

  // Global error filter provided via APP_FILTER in AppModule

  // Optional one-time verification event
  if (dsn && verifySetup) {
    try {
      Sentry.captureMessage('sentry-setup-ok', 'info')
    } catch {}
  }

  await app.listen(port)
}

// Only run when executed directly (not under tests)
if (require.main === module) {
  // eslint-disable-next-line no-console
  bootstrap().catch((err) => console.error(err))
}

export { bootstrap }
export function applyGlobalPrefix(app: INestApplication) {
  app.setGlobalPrefix('api/v1')
}
