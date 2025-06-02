import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS para permitir conexões do frontend Angular
  app.enableCors({
    origin: [
      'http://localhost:4200', // Angular dev server
      'http://localhost:3000', // Caso o frontend rode na 3000
      'https://fazenda-lol-stats.vercel.app', // Deploy do frontend (exemplo)
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);
