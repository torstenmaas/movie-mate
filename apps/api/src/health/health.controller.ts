import { Controller, Get, Res } from '@nestjs/common'
import type { Response } from 'express'
import { HealthService } from './health.service'
import { ApiExtension, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { HealthStatusDto } from './health.dto'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness / basic health' })
  @ApiResponse({ status: 200, description: 'Service is up', type: HealthStatusDto as any })
  @ApiExtension('x-error-codes', [])
  get() {
    return this.health.getStatus()
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness with DB check' })
  @ApiResponse({ status: 200, description: 'Service is ready', type: HealthStatusDto as any })
  @ApiResponse({ status: 503, description: 'DB unavailable', type: HealthStatusDto as any })
  @ApiExtension('x-error-codes', [])
  async ready(@Res() res: Response) {
    const status = await this.health.getStatus()
    if (status.db === 'ok') {
      return res.status(200).json(status)
    }
    return res.status(503).json({ ...status, status: 'error' as const })
  }
}
