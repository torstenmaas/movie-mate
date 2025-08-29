import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Errors & Validation (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns 422 with code and traceId on invalid login body', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({}).expect(422)
    expect(res.body).toHaveProperty('statusCode', 422)
    expect(res.body).toHaveProperty('error', 'GEN_VALIDATION_FAILED')
    expect(res.headers).toHaveProperty('x-trace-id')
    expect(res.body).toHaveProperty('traceId')
    expect(res.headers['x-trace-id']).toBe(res.body.traceId)
  })

  it('returns 401 with standardized error for missing bearer on /auth/me', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me').expect(401)
    expect(res.body).toHaveProperty('statusCode', 401)
    expect(res.body).toHaveProperty('error', 'GEN_UNAUTHORIZED')
    expect(res.headers).toHaveProperty('x-trace-id')
    expect(res.body).toHaveProperty('traceId')
    expect(res.headers['x-trace-id']).toBe(res.body.traceId)
  })
})
