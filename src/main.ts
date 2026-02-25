import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuracion de Swagger 

  const config = new DocumentBuilder()
  .setTitle('API con vulneravilidades de seguirdad en el desarrollo de la aplicacion')
  .setDescription('Documentacion de la API para el ejercicio de seguridad en el desarrollo de aplicaciones')
  .setVersion('1.0.0')
  .addTag('Tareas')
  .build();

  const document  = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs',app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
