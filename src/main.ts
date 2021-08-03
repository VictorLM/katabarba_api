import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
// import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppModule } from './app.module';
// import { MyLogger } from './custom.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: new MyLogger(),
  });
  // Class Validator
  app.useGlobalPipes(new ValidationPipe());
  // Catch all exceptions
  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  await app.listen(3000);
}
bootstrap();
