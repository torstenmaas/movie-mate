import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UnauthorizedException, ExecutionContext } from '@nestjs/common'

function mockContext(headers: Record<string, any>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers }) } as any),
  } as unknown as ExecutionContext
}

describe('JwtAuthGuard', () => {
  it('rejects when bearer is missing', async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        JwtService,
        { provide: ConfigService, useValue: { get: () => 'secret' } },
      ],
    }).compile()
    const guard = module.get(JwtAuthGuard)
    expect(() => guard.canActivate(mockContext({}))).toThrow(UnauthorizedException)
  })

  it('rejects when token is invalid', async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        JwtService,
        { provide: ConfigService, useValue: { get: () => 'secret' } },
      ],
    }).compile()
    const guard = module.get(JwtAuthGuard)
    expect(() => guard.canActivate(mockContext({ authorization: 'Bearer invalid' }))).toThrow(
      UnauthorizedException,
    )
  })

  it('accepts valid token', async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        JwtService,
        { provide: ConfigService, useValue: { get: () => 'secret' } },
      ],
    }).compile()
    const guard = module.get(JwtAuthGuard)
    const jwt = module.get(JwtService)
    const token = jwt.sign({ sub: 'u1' }, { secret: 'secret' })
    expect(guard.canActivate(mockContext({ authorization: `Bearer ${token}` }))).toBe(true)
  })
})

