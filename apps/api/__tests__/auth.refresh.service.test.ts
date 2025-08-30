import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { AuthService } from '../src/auth/auth.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

const baseConfig = {
  JWT_SECRET: 'secret',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'rsecret',
  JWT_REFRESH_EXPIRES_IN: '30d',
}

describe('AuthService.refresh (unit error paths)', () => {
  const now = new Date()

  const makeModule = async (
    overrides: Partial<{
      jwt: Partial<JwtService>
      prisma: Partial<PrismaService>
      config: Record<string, string>
    }>,
  ) => {
    const jwtImpl: Partial<JwtService> = overrides.jwt || {}
    const prismaImpl: any = overrides.prisma || {}
    const cfg = overrides.config || {}

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaImpl },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn(), ...jwtImpl } },
        {
          provide: ConfigService,
          useValue: {
            get: (k: string, d?: any) => (cfg[k] ?? (baseConfig as any)[k] ?? d),
          } as unknown as ConfigService,
        },
      ],
    }).compile()
    return module.get(AuthService)
  }

  it('throws when token verify fails (catch-all)', async () => {
    const service = await makeModule({ jwt: { verify: jest.fn(() => { throw new Error('bad') }) } })
    await expect(service.refresh('x')).rejects.toBeTruthy()
  })

  it('throws when jti/fid missing', async () => {
    const service = await makeModule({ jwt: { verify: jest.fn(() => ({ sub: 'u1' })) as any } })
    await expect(service.refresh('t')).rejects.toBeTruthy()
  })

  it('throws when refresh record not found', async () => {
    const prismaMock = { refreshToken: { findUnique: jest.fn().mockResolvedValue(null) } }
    const service = await makeModule({
      prisma: prismaMock as any,
      jwt: { verify: jest.fn(() => ({ sub: 'u1', jti: 'j1', fid: 'f1' })) as any },
    })
    await expect(service.refresh('t')).rejects.toBeTruthy()
  })

  it('revokes family and throws when record revoked', async () => {
    const updateMany = jest.fn().mockResolvedValue({})
    const prismaMock = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({ familyId: 'f1', revokedAt: now, expiresAt: new Date(now.getTime() + 1000) }),
        updateMany,
      },
    }
    const service = await makeModule({
      prisma: prismaMock as any,
      jwt: { verify: jest.fn(() => ({ sub: 'u1', jti: 'j1', fid: 'f1' })) as any },
    })
    await expect(service.refresh('t')).rejects.toBeTruthy()
    expect(updateMany).toHaveBeenCalledWith({ where: { familyId: 'f1', revokedAt: null }, data: { revokedAt: expect.any(Date) } })
  })

  it('revokes family and throws when record expired', async () => {
    const updateMany = jest.fn().mockResolvedValue({})
    const prismaMock = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({ familyId: 'f1', revokedAt: null, expiresAt: new Date(now.getTime() - 1000) }),
        updateMany,
      },
    }
    const service = await makeModule({
      prisma: prismaMock as any,
      jwt: { verify: jest.fn(() => ({ sub: 'u1', jti: 'j1', fid: 'f1' })) as any },
    })
    await expect(service.refresh('t')).rejects.toBeTruthy()
    expect(updateMany).toHaveBeenCalled()
  })

  it('throws when user not found', async () => {
    const prismaMock = {
      refreshToken: {
        findUnique: jest.fn().mockResolvedValue({ familyId: 'f1', revokedAt: null, expiresAt: new Date(now.getTime() + 10_000) }),
      },
      user: { findUnique: jest.fn().mockResolvedValue(null) },
    }
    const service = await makeModule({
      prisma: prismaMock as any,
      jwt: { verify: jest.fn(() => ({ sub: 'u1', jti: 'j1', fid: 'f1' })) as any },
    })
    await expect(service.refresh('t')).rejects.toBeTruthy()
  })
})
