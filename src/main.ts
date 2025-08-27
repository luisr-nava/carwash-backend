import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('CarWash');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'verbose'],
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,POST',
    allowedHeaders: '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ❌ elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // ❌ lanza error si envían algo que no está en el DTO
      transform: true, // ✅ transforma payloads a instancias de DTOs
    }),
  );
  try {
    logger.verbose(`🚀 Servidor ejecutándose en http://localhost:${envs.port}`);

    // const seeder = app.get(CategorySeeder);
    await app.listen(envs.port);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ El puerto ${envs.port} ya está en uso!`);
    } else {
      logger.error('❌ Error inesperado:', error);
    }
    process.exit(1);
  }
}
bootstrap();
