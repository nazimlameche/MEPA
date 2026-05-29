import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  if (!process.env['GEMINI_API_KEY']) {
    throw new Error('GEMINI_API_KEY is required');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [process.env['NEXTAUTH_URL'] ?? 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env['PORT'] ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}

void bootstrap();
