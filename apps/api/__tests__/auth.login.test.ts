import { Test } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

describe('AuthService.login', () => {
  it('issues tokens for valid credentials', async () => {
    const password = 'VeryStrongPassw0rd';
    const hash = await argon2.hash(password, { type: argon2.argon2id });

    const prismaMock = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.c', displayName: 'A', hashedPassword: hash, emailVerified: false }),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({}),
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
    const out = await service.login('a@b.c', password);
    expect(out).toHaveProperty('accessToken');
    expect(out).toHaveProperty('refreshToken');
  });
});
