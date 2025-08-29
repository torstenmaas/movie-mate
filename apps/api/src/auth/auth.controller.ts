import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
}

