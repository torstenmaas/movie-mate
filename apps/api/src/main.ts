import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

// Only run when executed directly (not under tests)
if (require.main === module) {
  // eslint-disable-next-line no-console
  bootstrap().catch((err) => console.error(err));
}

export { bootstrap };

