import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RateLimitGuard implements CanActivate {
  private hits = new Map<string, number[]>()
  private windowMs: number
  private maxPerMin: number

  constructor(private readonly config: ConfigService) {
    this.windowMs = 60_000
    this.maxPerMin = parseInt(this.config.get<string>('RATE_LIMIT_AUTH_PER_MIN', '100')!, 10)
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - this.windowMs
    const key = ip
    const arr = this.hits.get(key) || []
    const recent = arr.filter((t) => t > windowStart)
    recent.push(now)
    this.hits.set(key, recent)
    if (recent.length > this.maxPerMin) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS)
    }
    return true
  }
}
