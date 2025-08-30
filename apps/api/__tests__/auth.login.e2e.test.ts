import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

const RUN_DB = process.env.RUN_DB_TESTS === 'true'
const itIf = RUN_DB ? it : it.skip
const describeIf = RUN_DB ? describe : describe.skip

describeIf('Auth Login (e2e with DB)', () => {
  let app: INestApplication
  let prisma: PrismaService
  const email = `login-e2e-${Date.now()}@example.com`
  const password = 'VeryStrongPassw0rd'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    await app.init()

    // ensure user exists
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, displayName: 'Login E2E', preferredLocale: 'de', acceptTerms: true })
      .expect(201)
  })

  afterAll(async () => {
    await prisma.user.delete({ where: { email } }).catch(() => undefined)
    await app.close()
  })

  itIf('logs in and calls /auth/me', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200)
    const access = login.body.accessToken as string
    expect(access).toBeTruthy()
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(200)
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${access}`)
      .expect(204)
  })
})
