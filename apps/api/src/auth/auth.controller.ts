import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiExtension } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterSchema } from './dto/register.dto'
import { LoginSchema } from './dto/login.dto'
import { RefreshSchema } from './dto/refresh.dto'
import { RegisterBody } from './dto/register.swagger'
import { LoginBody } from './dto/login.swagger'
import { RefreshBody } from './dto/refresh.swagger'
import { JwtAuthGuard } from './jwt-auth.guard'
import { RateLimitGuard } from '../common/guards/rate-limit.guard'
import { ConfigService } from '@nestjs/config'
import { UserDto } from './dto/user.swagger'
import { LoginResponse } from './dto/login.response'
import { RefreshResponse } from './dto/refresh.response'
import { MeResponse } from './dto/me.response'
import { ErrorDto } from '../common/dto/error.dto'

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
  @ApiBody({ type: RegisterBody })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: import('./dto/user.swagger').then((m) => m.UserDto) as any,
  })
  @ApiResponse({ status: 422, description: 'Validation failed', type: ErrorDto as any })
  @ApiResponse({ status: 409, description: 'Duplicate register', type: ErrorDto as any })
  @ApiExtension('x-error-codes', ['GEN_VALIDATION_FAILED', 'GEN_CONFLICT'])
  async register(@Body() body: unknown) {
    const parsed = await RegisterSchema.safeParseAsync(body)
    if (!parsed.success)
      throw new UnprocessableEntityException({
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      })
    return this.auth.register(parsed.data)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: LoginBody })
  @ApiResponse({
    status: 200,
    description: 'Returns access & refresh tokens',
    type: import('./dto/login.response').then((m) => m.LoginResponse) as any,
  })
  @ApiResponse({ status: 422, description: 'Validation failed', type: ErrorDto as any })
  @ApiResponse({ status: 401, description: 'Invalid credentials', type: ErrorDto as any })
  @ApiExtension('x-error-codes', ['GEN_VALIDATION_FAILED', 'AUTH_INVALID_CREDENTIALS'])
  async login(@Body() body: unknown, @Req() req: any) {
    const parsed = await LoginSchema.safeParseAsync(body)
    if (!parsed.success)
      throw new UnprocessableEntityException({
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      })
    return this.auth.login(parsed.data.email, parsed.data.password, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token pair' })
  @ApiBody({ type: RefreshBody })
  @ApiResponse({
    status: 200,
    description: 'New token pair',
    type: import('./dto/refresh.response').then((m) => m.RefreshResponse) as any,
  })
  @ApiResponse({ status: 422, description: 'Validation failed', type: ErrorDto as any })
  @ApiResponse({ status: 401, description: 'Refresh invalid/rotated', type: ErrorDto as any })
  @ApiExtension('x-error-codes', ['GEN_VALIDATION_FAILED', 'AUTH_REFRESH_REVOKED'])
  async refresh(@Body() body: unknown, @Req() req: any) {
    const parsed = await RefreshSchema.safeParseAsync(body)
    if (!parsed.success)
      throw new UnprocessableEntityException({
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      })
    return this.auth.refresh(parsed.data.refreshToken, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, type: import('./dto/me.response').then((m) => m.MeResponse) as any })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto as any })
  @ApiExtension('x-error-codes', ['GEN_UNAUTHORIZED'])
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
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto as any })
  @ApiExtension('x-error-codes', ['GEN_UNAUTHORIZED'])
  async logout(@Body() body: any) {
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
    return
  }
}
