import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable raw body parsing
  app.use(json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  }));
  
  // Use port from environment variable or default to 3000
  const port = process.env.PORT || 3000;
  
  // Add keep-alive route
  app.get('/ping', (req, res) => {
    res.send('pong');
  });

  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
