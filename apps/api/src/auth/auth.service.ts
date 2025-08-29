import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { RegisterInput } from './dto/register.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { randomUUID, createHash } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterInput) {
    const argon2 = await import('argon2')
    const email = input.email
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException({ error: 'GEN_CONFLICT', message: 'Email already registered.' })
    }

    const hashedPassword = await argon2.hash(input.password, { type: (argon2 as any).argon2id })
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: input.displayName,
        hashedPassword,
        preferredLocale: input.preferredLocale ?? 'de',
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        preferredLocale: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return user
  }

  async login(email: string, password: string, meta?: { userAgent?: string; ip?: string }) {
    const argon2 = await import('argon2')
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user)
      throw new UnauthorizedException({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      })
    const ok = await argon2.verify(user.hashedPassword, password)
    if (!ok)
      throw new UnauthorizedException({
        error: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      })

    const tokens = await this.issueTokensWithRefreshRecord(user.id, user.email, undefined, meta)
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        preferredLocale: (user as any).preferredLocale ?? 'de',
        emailVerified: user.emailVerified,
      },
      ...tokens,
    }
  }

  async refresh(refreshToken: string, meta?: { userAgent?: string; ip?: string }) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      }) as any
      const jti = payload.jti as string | undefined
      const fid = payload.fid as string | undefined
      if (!jti || !fid)
        throw new UnauthorizedException({
          error: 'AUTH_REFRESH_REVOKED',
          message: 'Invalid or revoked refresh token',
        })

      const repo = (this.prisma as any).refreshToken
      const record = await repo.findUnique({ where: { jti } })
      if (!record)
        throw new UnauthorizedException({
          error: 'AUTH_REFRESH_REVOKED',
          message: 'Invalid or revoked refresh token',
        })

      const now = new Date()
      if (record.revokedAt || record.expiresAt <= now) {
        await repo.updateMany({
          where: { familyId: record.familyId, revokedAt: null },
          data: { revokedAt: now },
        })
        throw new UnauthorizedException({
          error: 'AUTH_REFRESH_REVOKED',
          message: 'Invalid or revoked refresh token',
        })
      }

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user)
        throw new UnauthorizedException({
          error: 'AUTH_REFRESH_REVOKED',
          message: 'Invalid or revoked refresh token',
        })

      const next = await this.issueTokensWithRefreshRecord(
        user.id,
        user.email,
        record.familyId,
        meta,
      )
      await repo.update({
        where: { jti },
        data: { revokedAt: now, replacedById: (next as any).refreshJti },
      })
      return next
    } catch {
      throw new UnauthorizedException({
        error: 'AUTH_REFRESH_REVOKED',
        message: 'Invalid or revoked refresh token',
      })
    }
  }

  private async issueTokensWithRefreshRecord(
    sub: string,
    email: string,
    familyId?: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const accessToken = this.jwt.sign(
      { sub, email },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
      },
    )
    const fid = familyId ?? randomUUID()
    const jti = randomUUID()
    const refreshToken = this.jwt.sign(
      { sub, email, jti, fid },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
      },
    )

    const expiresAt = this.computeExpiryFromNow(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d',
    )
    const hashed = this.hashToken(refreshToken)
    const repo = (this.prisma as any).refreshToken
    await repo.create({
      data: {
        userId: sub,
        jti,
        familyId: fid,
        hashedToken: hashed,
        userAgent: meta?.userAgent,
        ip: meta?.ip,
        expiresAt,
      },
    })
    return { accessToken, refreshToken, refreshJti: jti }
  }

  private computeExpiryFromNow(spec: string): Date {
    const m = spec.match(/^(\d+)([smhd])$/i)
    if (!m) return new Date(Date.now() + 30 * 24 * 3600 * 1000)
    const n = parseInt(m[1] as string, 10)
    const unit = (m[2] as string).toLowerCase()
    const mult: any = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
    return new Date(Date.now() + n * mult[unit])
  }

  private hashToken(token: string): string {
    const pepper = this.config.get<string>('REFRESH_PEPPER', '')
    return createHash('sha256')
      .update(token + pepper)
      .digest('hex')
  }
}
