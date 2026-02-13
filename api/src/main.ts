import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PokedexApiModule } from './pokedex-api.module';

async function bootstrap() {
  const app = await NestFactory.create(PokedexApiModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
