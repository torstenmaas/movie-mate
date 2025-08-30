import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const db = await this.checkDb(1500)
    const rawCommit =
      process.env.IMAGE_COMMIT ||
      process.env.SOURCE_COMMIT ||
      process.env.GIT_SHA ||
      process.env.COMMIT_SHA ||
      undefined
    const commitShort =
      rawCommit && rawCommit !== 'HEAD' ? String(rawCommit).slice(0, 7) : undefined
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: process.env.APP_NAME
        ? `${process.env.APP_NAME}@${process.env.NODE_ENV ?? 'dev'}`
        : 'movie-mate',
      commit: commitShort,
      db,
    }
  }

  private async checkDb(timeoutMs: number): Promise<'ok' | 'down'> {
    let timer: NodeJS.Timeout | undefined
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1` as unknown as Promise<unknown>,
        new Promise((_, rej) => {
          timer = setTimeout(() => rej(new Error('timeout')), timeoutMs)
          // do not keep the event loop open because of this timer
          // @ts-ignore Node types allow unref in runtime environments that support it
          if (typeof (timer as any)?.unref === 'function') (timer as any).unref()
        }),
      ])
      return 'ok'
    } catch {
      return 'down'
    } finally {
      if (timer) clearTimeout(timer)
    }
  }
}
