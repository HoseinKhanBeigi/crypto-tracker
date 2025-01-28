import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Use port from environment variable or default to 3000
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
}
bootstrap();
