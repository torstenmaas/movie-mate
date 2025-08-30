import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { INestApplication } from '@nestjs/common'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

async function bootstrap() {
  // Bootstrap a DI context (no HTTP platform) to access ConfigService
  const tempCtx = await NestFactory.createApplicationContext(AppModule, { logger: false })
  const config = tempCtx.get(ConfigService)
  await tempCtx.close()

  // Config values
  const port = config.get<number>('PORT', 3000)
  const origins = (config.get<string[]>('CORS_ORIGINS', []) || []) as string[]

  const app = await NestFactory.create(AppModule)
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

  // Global error filter provided via APP_FILTER in AppModule

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
