import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterInput } from './dto/register.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(input: RegisterInput) {
    const email = input.email;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({ error: 'AUTH_CONFLICT', message: 'Email already registered.' });
    }

    const hashedPassword = await argon2.hash(input.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName: input.displayName,
        hashedPassword,
        preferredLocale: input.preferredLocale ?? 'de',
      },
      select: { id: true, email: true, displayName: true, preferredLocale: true, emailVerified: true, createdAt: true },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.hashedPassword, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = this.issueTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        preferredLocale: (user as any).preferredLocale ?? 'de',
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: this.config.get<string>('JWT_REFRESH_SECRET') });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Invalid refresh');
      const tokens = this.issueTokens(user.id, user.email);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh');
    }
  }

  private issueTokens(sub: string, email: string) {
    const accessToken = this.jwt.sign(
      { sub, email },
      { secret: this.config.get<string>('JWT_SECRET'), expiresIn: this.config.get<string>('JWT_EXPIRES_IN') },
    );
    const refreshToken = this.jwt.sign(
      { sub, email },
      { secret: this.config.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') },
    );
    return { accessToken, refreshToken };
  }
}
