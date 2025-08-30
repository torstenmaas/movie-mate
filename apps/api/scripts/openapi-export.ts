import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false })
  const doc = new DocumentBuilder()
    .setTitle('Movie Mate API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, doc)
  // Write next to src/ at apps/api/openapi.json
  const out = resolve(__dirname, '..', 'openapi.json')
  writeFileSync(out, JSON.stringify(document, null, 2), 'utf8')
  await app.close()
  // eslint-disable-next-line no-console
  console.log(`OpenAPI exported to ${out}`)
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
