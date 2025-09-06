import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { trpcMiddleware } from './trpc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use('/trpc', trpcMiddleware);
  await app.listen(3000);
}
bootstrap();
