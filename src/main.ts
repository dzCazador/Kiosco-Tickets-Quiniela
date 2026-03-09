import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import e from 'express';
import { envs } from './config';

async function bootstrap() {
const app = await NestFactory.create<NestExpressApplication>(AppModule);
const logger  = new Logger('Main');
// 1. Validación Global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 2. Habilitar CORS para React
  app.enableCors();

  app.setGlobalPrefix('api');

  // 3. Servir carpeta de imágenes
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  const port = process.env.PORT || envs.PORT || 3000;

  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
