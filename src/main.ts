import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    skipNullProperties: true,
    whitelist: true,
  }));

  //Configuracion de Swagger
  const config = new DocumentBuilder()
    .setTitle('API con vulerabilidades de seguridad')
    .setDescription('Docmentación de la API para pruebas de seguridad')
    .setVersion('1.0.0')
    .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
