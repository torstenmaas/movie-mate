import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const RUN_DB = process.env.RUN_DB_TESTS === 'true'
const itIf = RUN_DB ? it : it.skip
const describeIf = RUN_DB ? describe : describe.skip

describeIf('Health (e2e with DB)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  itIf('GET /health returns db ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200)
    expect(res.body).toHaveProperty('db', 'ok')
  })

  itIf('GET /health/ready returns 200 when DB ok', async () => {
    await request(app.getHttpServer()).get('/health/ready').expect(200)
  })
})
