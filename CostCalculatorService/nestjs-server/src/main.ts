import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
      .setTitle('Cost calculator Service')
      .setDescription('The cost calculator service API description')
      .setVersion('1.0')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  await app.listen(4000);
}
bootstrap();
