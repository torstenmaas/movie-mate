import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterSchema } from './dto/register.dto'
import { LoginSchema } from './dto/login.dto'
import { RefreshSchema } from './dto/refresh.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RateLimitGuard } from '../common/guards/rate-limit.guard'
import { ConfigService } from '@nestjs/config'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'VeryStrongPassw0rd' },
        displayName: { type: 'string', example: 'Max Mustermann' },
        preferredLocale: { type: 'string', enum: ['de', 'en'], default: 'de' },
        acceptTerms: { type: 'boolean', example: true },
        marketingOptIn: { type: 'boolean', example: false },
      },
      required: ['email', 'password', 'displayName', 'acceptTerms'],
    },
  })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() body: unknown) {
    const parsed = await RegisterSchema.safeParseAsync(body)
    if (!parsed.success) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      }
    }
    const user = await this.auth.register(parsed.data)
    return user
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'VeryStrongPassw0rd' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Returns access & refresh tokens' })
  async login(@Body() body: unknown, @Req() req: any, @Res() res: Response) {
    const parsed = await LoginSchema.safeParseAsync(body)
    if (!parsed.success) {
      return res.status(422).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      })
    }
    const out = await this.auth.login(parsed.data.email, parsed.data.password, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })
    if (this.config.get('REFRESH_TOKEN_COOKIE') === 'true') {
      const cookieName = this.config.get<string>('REFRESH_COOKIE_NAME') || 'refreshToken'
      const csrfName = this.config.get<string>('CSRF_COOKIE_NAME') || 'csrfToken'
      const secure = this.config.get<string>('COOKIE_SECURE', 'false') === 'true'
      const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined
      const csrf = Math.random().toString(36).slice(2)
      res.cookie(cookieName, out.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        domain,
        path: '/',
      })
      res.cookie(csrfName, csrf, { httpOnly: false, secure, sameSite: 'lax', domain, path: '/' })
    }
    return res.status(200).json(out)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token pair' })
  @ApiBody({
    schema: { properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] },
  })
  async refresh(@Body() body: unknown, @Req() req: any, @Res() res: Response) {
    const parsed = await RefreshSchema.safeParseAsync(body)
    if (!parsed.success && this.config.get('REFRESH_TOKEN_COOKIE') !== 'true') {
      return res.status(422).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      })
    }
    let token = parsed.success ? parsed.data.refreshToken : undefined
    if (this.config.get('REFRESH_TOKEN_COOKIE') === 'true') {
      // @ts-ignore cookie-parser assumed in main.ts when cookie mode is enabled
      token = req.cookies?.[this.config.get<string>('REFRESH_COOKIE_NAME') || 'refreshToken']
      const headerName = (
        this.config.get<string>('CSRF_HEADER_NAME') || 'x-csrf-token'
      ).toLowerCase()
      const csrfHeader = req.headers[headerName]
      // @ts-ignore
      const csrfCookie = req.cookies?.[this.config.get<string>('CSRF_COOKIE_NAME') || 'csrfToken']
      if (!csrfHeader || csrfHeader !== csrfCookie) {
        return res.status(401).json({ error: 'GEN_UNAUTHORIZED', message: 'CSRF check failed' })
      }
    }
    const out = await this.auth.refresh(token!, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })
    if (this.config.get('REFRESH_TOKEN_COOKIE') === 'true') {
      const cookieName = this.config.get<string>('REFRESH_COOKIE_NAME') || 'refreshToken'
      const secure = this.config.get<string>('COOKIE_SECURE', 'false') === 'true'
      const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined
      res.cookie(cookieName, out.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        domain,
        path: '/',
      })
    }
    return res.status(200).json(out)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  me(@Req() req: any) {
    const u = req.user
    return { sub: u.sub, email: u.email }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (stateless); with refreshToken body optionally revokes family' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  async logout(@Body() body: any, @Res() res: Response) {
    // Optional server-side revoke by family
    const token = body?.refreshToken as string | undefined
    if (token) {
      try {
        const payload = (this.auth as any)['jwt'].verify(token, {
          secret: (this.auth as any)['config'].get('JWT_REFRESH_SECRET') as string,
        }) as any
        const fid = payload?.fid as string | undefined
        if (fid) {
          const repo = (this.auth as any)['prisma'].refreshToken
          await repo.updateMany({
            where: { familyId: fid, revokedAt: null },
            data: { revokedAt: new Date() },
          })
        }
      } catch {
        // ignore invalid on logout
      }
    }
    if (this.config.get('REFRESH_TOKEN_COOKIE') === 'true') {
      const cookieName = this.config.get<string>('REFRESH_COOKIE_NAME') || 'refreshToken'
      const csrfName = this.config.get<string>('CSRF_COOKIE_NAME') || 'csrfToken'
      const secure = this.config.get<string>('COOKIE_SECURE', 'false') === 'true'
      const domain = this.config.get<string>('COOKIE_DOMAIN') || undefined
      res.cookie(cookieName, '', {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        domain,
        path: '/',
        maxAge: 0,
      })
      res.cookie(csrfName, '', {
        httpOnly: false,
        secure,
        sameSite: 'lax',
        domain,
        path: '/',
        maxAge: 0,
      })
    }
    return res.status(204).send()
  }
}
