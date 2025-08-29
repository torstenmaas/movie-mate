import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@infra/prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      // Best-effort connect; don't crash app if DB is not reachable
      await this.$connect()
    } catch {
      // ignore; health check will report down
    }
  }

  async onModuleDestroy() {
    await this.$disconnect().catch(() => undefined)
  }
}
