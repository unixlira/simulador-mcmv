import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configurar } from './configurar.js';

async function bootstrap() {
  const app = configurar(await NestFactory.create<NestExpressApplication>(AppModule));
  // Atrás do nginx da VPS: o IP real vem do X-Forwarded-For (rate limit por cliente).
  app.set('trust proxy', 1);
  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
