import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

const RUN_DB = process.env.RUN_DB_TESTS === 'true'
const itIf = RUN_DB ? it : it.skip
const describeIf = RUN_DB ? describe : describe.skip

describeIf('Auth Refresh Rotation (e2e with DB)', () => {
  let app: INestApplication
  let prisma: PrismaService
  const email = `refresh-e2e-${Date.now()}@example.com`
  const password = 'VeryStrongPassw0rd'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    await app.init()

    // register user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        displayName: 'Refresh E2E',
        preferredLocale: 'de',
        acceptTerms: true,
      })
      .expect(201)
  })

  afterAll(async () => {
    await prisma.user.delete({ where: { email } }).catch(() => undefined)
    await app.close()
  })

  itIf('rotates refresh and rejects reuse', async () => {
    // login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
    const r1 = login.body.refreshToken as string
    expect(r1).toBeTruthy()

    // refresh with r1 -> r2
    const ref1 = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: r1 })
      .expect(200)
    const r2 = ref1.body.refreshToken as string
    expect(r2).toBeTruthy()

    // reuse old r1 should fail and revoke family
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: r1 }).expect(401)

    // the new r2 should also be invalid after family revoke
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: r2 }).expect(401)
  })

  itIf('logout revokes family', async () => {
    // login
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
    const access = login.body.accessToken as string
    const r = login.body.refreshToken as string

    // logout with refreshToken in body (requires bearer)
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${access}`)
      .send({ refreshToken: r })
      .expect(204)

    // further refresh attempts fail
    await request(app.getHttpServer()).post('/auth/refresh').send({ refreshToken: r }).expect(401)
  })
})
