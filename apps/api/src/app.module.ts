import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { PrismaService } from './prisma/prisma.service';
import { validateEnv } from './config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService, PrismaService],
})
export class AppModule {}
