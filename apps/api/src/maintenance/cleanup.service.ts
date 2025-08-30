import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CleanupService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout
  private readonly intervalMs = 6 * 60 * 60 * 1000 // 6h

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    const run = async () => {
      const now = new Date()
      const retentionDays = parseInt(this.config.get<string>('REFRESH_RETENTION_DAYS', '30')!, 10)
      const cutoff = new Date(now.getTime() - retentionDays * 24 * 3600 * 1000)
      try {
        await this.prisma.refreshToken.deleteMany({
          where: {
            OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null, lt: cutoff } }],
          },
        })
      } catch {}
    }
    // run shortly after startup, then on schedule
    setTimeout(run, 10_000).unref()
    this.timer = setInterval(run, this.intervalMs)
    // don't keep event loop alive
    // @ts-ignore
    if (typeof this.timer?.unref === 'function') this.timer.unref()
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }
}
