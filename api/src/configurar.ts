import { type INestApplication, ValidationPipe } from '@nestjs/common';

// Usado pelo main.ts e pelos testes e2e, para os dois rodarem igual.
export function configurar<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  return app;
}
