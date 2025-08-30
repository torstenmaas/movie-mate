import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { AuthController } from '../src/auth/auth.controller'
import { AuthService } from '../src/auth/auth.service'
import { ConfigService } from '@nestjs/config'

describe('AuthController (unit)', () => {
  const user = {
    id: 'u1',
    email: 'test@example.com',
    displayName: 'Test',
    preferredLocale: 'de',
    emailVerified: false,
  }

  it('register forwards to service on valid input', async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { register: jest.fn().mockResolvedValue(user) } },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: (await import('@nestjs/jwt')).JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile()

    const controller = module.get(AuthController)
    const result = await controller.register({
      email: user.email,
      password: 'VeryStrongPassw0rd',
      displayName: user.displayName,
      preferredLocale: 'de',
      acceptTerms: true,
    })
    expect(result).toEqual(user)
  })

  it('login forwards email/password and meta', async () => {
    const loginResult = { user, accessToken: 'a', refreshToken: 'r' }
    const register = jest.fn()
    const login = jest.fn().mockResolvedValue(loginResult)
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { register, login } },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: (await import('@nestjs/jwt')).JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile()

    const controller = module.get(AuthController)
    const req: any = { headers: { 'user-agent': 'jest' }, ip: '127.0.0.1' }
    const result = await controller.login(
      { email: user.email, password: 'VeryStrongPassw0rd' },
      req,
    )
    expect(login).toHaveBeenCalledWith(user.email, 'VeryStrongPassw0rd', {
      userAgent: 'jest',
      ip: '127.0.0.1',
    })
    expect(result).toEqual(loginResult)
  })

  it('refresh forwards refreshToken and meta', async () => {
    const refresh = jest.fn().mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' })
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { refresh } },
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: (await import('@nestjs/jwt')).JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile()

    const controller = module.get(AuthController)
    const req: any = { headers: { 'user-agent': 'jest' }, ip: '127.0.0.1' }
    const token = 'r1234567890'
    const result = await controller.refresh({ refreshToken: token }, req)
    expect(refresh).toHaveBeenCalledWith(token, { userAgent: 'jest', ip: '127.0.0.1' })
    expect(result).toEqual({ accessToken: 'a2', refreshToken: 'r2' })
  })

  it('me returns sub/email from req', () => {
    const controller = new AuthController({} as any, {} as any)
    const r = controller.me({ user: { sub: 'u1', email: 'e@example.com' } } as any)
    expect(r).toEqual({ sub: 'u1', email: 'e@example.com' })
  })

  it('logout resolves without error (no refreshToken)', async () => {
    const controller = new AuthController({} as any, {} as any)
    await expect(controller.logout({})).resolves.toBeUndefined()
  })
})
