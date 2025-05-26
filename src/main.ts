import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from '@modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);
  const isDevelopmentMode: boolean =
    configService.get<'test' | 'develop' | 'production'>('mode') !==
    'production';
  const appName: string = configService.get<string>('appName');

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('/api');

  if (isDevelopmentMode) {
    const options = new DocumentBuilder()
      .setTitle(`${appName} API`)
      .setDescription(`${appName} api services`)
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api/docs', app, document);
  }

  await app.listen(configService.get<number>('port'));
}
bootstrap();
