import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HealthController } from '../src/health/health.controller';

describe('Health (unit)', () => {
  it('returns ok status', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const controller = moduleRef.get(HealthController);
    const res = controller.get();
    expect(res).toHaveProperty('status', 'ok');
    expect(res).toHaveProperty('timestamp');
  });
});
