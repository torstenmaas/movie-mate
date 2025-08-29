import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RegisterInput } from './dto/register.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
}

