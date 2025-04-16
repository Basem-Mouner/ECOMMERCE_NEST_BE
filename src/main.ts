import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setLanguage } from './common/middleware/function/language.function.middleware';
import * as express from 'express';
import { resolve } from 'path';
// import { ValidationPipe } from '@nestjs/common';
// import { config } from 'dotenv';
// // import { resolve } from 'path';

// // config({ path: resolve('./config/.env.dev') });

async function bootstrap() {
  const port: number | string = (process.env.PORT as string) ?? 3000;
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  //   }),
  // );
  // app.use(setLanguage);

  //__________static file enable________but use cloudinary in site
  app.enableCors();
  app.use('/order/webhook', express.raw({ type: 'application/json' }));
  app.use('/uploads', express.static(resolve('./uploads/')));
  await app.listen(port, () => {
    console.log(`Application is running on: ${port}`);
  });
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});
