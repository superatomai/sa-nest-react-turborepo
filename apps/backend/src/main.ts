import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';

// Load environment variables
dotenv.config();
import { trpcMiddleware, setNestApp } from './trpc';

async function bootstrap() {
  console.log('🚀 Starting NestJS application...');
  
  const app = await NestFactory.create(AppModule);
  
  // Set the NestJS app for tRPC
  setNestApp(app);
  
  console.log('✅ NestJS app created successfully');
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  
  app.use(clerkMiddleware());
  app.use('/trpc', trpcMiddleware);
  
  await app.listen(3000);
  
  console.log('🎉 Server is running on http://localhost:3000');
}
bootstrap().catch(err => {
  console.error('❌ Failed to start server:', err);
});