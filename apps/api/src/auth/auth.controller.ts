import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';
import { LoginSchema } from './dto/login.dto';
import { RefreshSchema } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' }, password: { type: 'string', example: 'VeryStrongPassw0rd' }, displayName: { type: 'string', example: 'Max Mustermann' }, preferredLocale: { type: 'string', enum: ['de','en'], default: 'de' }, acceptTerms: { type: 'boolean', example: true }, marketingOptIn: { type: 'boolean', example: false } }, required: ['email','password','displayName','acceptTerms'] } })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() body: unknown) {
    const parsed = await RegisterSchema.safeParseAsync(body);
    if (!parsed.success) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      };
    }
    const user = await this.auth.register(parsed.data);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ schema: { properties: { email: { type: 'string', example: 'user@example.com' }, password: { type: 'string', example: 'VeryStrongPassw0rd' } }, required: ['email','password'] } })
  @ApiResponse({ status: 200, description: 'Returns access & refresh tokens' })
  async login(@Body() body: unknown) {
    const parsed = await LoginSchema.safeParseAsync(body);
    if (!parsed.success) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      };
    }
    return this.auth.login(parsed.data.email, parsed.data.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token pair' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } })
  async refresh(@Body() body: unknown) {
    const parsed = await RefreshSchema.safeParseAsync(body);
    if (!parsed.success) {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'GEN_VALIDATION_FAILED',
        message: 'Invalid input',
        details: parsed.error.flatten(),
      };
    }
    return this.auth.refresh(parsed.data.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  me(@Req() req: any) {
    const u = req.user;
    return { sub: u.sub, email: u.email };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (stateless): client discards tokens' })
  @ApiResponse({ status: 204, description: 'Logged out (stateless)' })
  async logout() {
    // Stateless JWT: nothing to revoke on server right now
    return;
  }
}
