import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'
import { HealthController } from './health/health.controller'
import { HealthService } from './health/health.service'
import { PrismaService } from './prisma/prisma.service'
import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { JwtModule } from '@nestjs/jwt'
import { RateLimitGuard } from './common/guards/rate-limit.guard'
import { validateEnv } from './config/config.schema'
import { traceIdMiddleware } from './common/middlewares/traceid.middleware'
import { CleanupService } from './maintenance/cleanup.service'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          pinoHttp: {
            level: config.get<string>('LOG_LEVEL', 'info'),
            redact: ['req.headers.authorization', 'req.headers.cookie'],
            genReqId: (req: any) =>
              (req.headers['x-request-id'] as string) || Math.random().toString(36).slice(2),
            autoLogging: true,
          },
        } as any
      },
    }),
    JwtModule.register({}),
  ],
  controllers: [HealthController, AuthController],
  providers: [
    HealthService,
    PrismaService,
    AuthService,
    RateLimitGuard,
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    CleanupService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(traceIdMiddleware).forRoutes('*')
  }
}
