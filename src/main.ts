import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';

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

  // 3. Servir carpeta de imágenes
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
