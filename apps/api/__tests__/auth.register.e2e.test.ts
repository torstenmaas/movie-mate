import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

const RUN_DB = process.env.RUN_DB_TESTS === 'true'
const itIf = RUN_DB ? it : it.skip
const describeIf = RUN_DB ? describe : describe.skip

describeIf('Auth Register (e2e with DB)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  itIf('registers a new user', async () => {
    const email = `e2e-${Date.now()}@example.com`
    const payload = {
      email,
      password: 'VeryStrongPassw0rd',
      displayName: 'E2E User',
      preferredLocale: 'de',
      acceptTerms: true,
      marketingOptIn: false,
    }

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(payload)
      .expect(201)
    expect(res.body).toHaveProperty('email', email.toLowerCase())

    // duplicate should 409
    await request(app.getHttpServer()).post('/api/v1/auth/register').send(payload).expect(409)

    // cleanup
    await prisma.user.delete({ where: { email } }).catch(() => undefined)
  })
})
