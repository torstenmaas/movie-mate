import { Module } from '@nestjs/common'
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
  providers: [HealthService, PrismaService, AuthService, RateLimitGuard],
})
export class AppModule {}
