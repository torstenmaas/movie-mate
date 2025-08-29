import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  get() {
    return this.health.getStatus();
  }

  @Get('ready')
  async ready(@Res() res: Response) {
    const status = await this.health.getStatus();
    if (status.db === 'ok') {
      return res.status(200).json(status);
    }
    return res.status(503).json({ ...status, status: 'error' as const });
  }
}
