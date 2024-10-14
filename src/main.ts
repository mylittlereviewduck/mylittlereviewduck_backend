import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'debug', 'warn'],
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('today-review')
    .setDescription(
      `
    모든 서버 에러는 상태코드 500으로 반환됩니다. \n 
    만료된 토큰의 경우 상태코드 401, "message": "Authentication TimeOut" 으로 반환됩니다. \n
    토큰이 유효하지않을 경우 상태코드 401, "message": "Invalid Token"으로 반환됩니다. \n
    토큰이 없을때는 상태코드 401, "message": "No Token"으로 반환됩니다. \n
    `,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
