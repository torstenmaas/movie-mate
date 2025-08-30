import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { HealthController } from '../src/health/health.controller'
import { HealthService } from '../src/health/health.service'

describe('HealthController.ready', () => {
  it('returns 503 when db is down', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getStatus: async () => ({ status: 'ok', timestamp: '', version: 'x', db: 'down' }),
          },
        },
      ],
    }).compile()

    const ctrl = module.get(HealthController)
    const res: any = {
      code: 0,
      jsonBody: null as any,
      status(code: number) {
        this.code = code
        return this
      },
      json(body: any) {
        this.jsonBody = body
        return this
      },
    }
    await ctrl.ready(res as any)
    expect(res.code).toBe(503)
    expect(res.jsonBody).toHaveProperty('status', 'error')
  })

  it('returns 200 when db ok', async () => {
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getStatus: async () => ({ status: 'ok', timestamp: '', version: 'x', db: 'ok' }),
          },
        },
      ],
    }).compile()

    const ctrl = module.get(HealthController)
    const res: any = {
      code: 0,
      status(code: number) {
        this.code = code
        return this
      },
      json() {
        return this
      },
    }
    await ctrl.ready(res as any)
    expect(res.code).toBe(200)
  })
})
