import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService.register', () => {
  it('creates a new user when email is free', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', displayName: 'A', preferredLocale: 'de', emailVerified: false, createdAt: new Date() }),
      },
    } as unknown as PrismaService;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        JwtService,
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => ({
          JWT_SECRET: 'secret', JWT_EXPIRES_IN: '15m', JWT_REFRESH_SECRET: 'rsecret', JWT_REFRESH_EXPIRES_IN: '30d'
        } as any)[k] ?? d } as unknown as ConfigService },
      ],
    }).compile();

    const service = module.get(AuthService);
    const user = await service.register({ email: 'A@B.C', password: 'VeryStrongPassw0rd', displayName: 'A', preferredLocale: 'de', acceptTerms: true, marketingOptIn: false });
    expect(user.email).toBe('a@b.c');
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it('rejects if email exists', async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1' }),
      },
    } as unknown as PrismaService;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        JwtService,
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => ({
          JWT_SECRET: 'secret', JWT_EXPIRES_IN: '15m', JWT_REFRESH_SECRET: 'rsecret', JWT_REFRESH_EXPIRES_IN: '30d'
        } as any)[k] ?? d } as unknown as ConfigService },
      ],
    }).compile();

    const service = module.get(AuthService);
    await expect(
      service.register({ email: 'x@y.z', password: 'VeryStrongPassw0rd', displayName: 'A', preferredLocale: 'de', acceptTerms: true, marketingOptIn: false }),
    ).rejects.toBeTruthy();
  });
});
