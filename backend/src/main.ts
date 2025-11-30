import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Cho phép Frontend (localhost:3001) gọi sang
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // -------------------------------------

  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = configService.get<number>('port', 3000);
  await app.listen(port);

  console.log(`🚀 Server is running on http://localhost:${port}`);
}
void bootstrap();
