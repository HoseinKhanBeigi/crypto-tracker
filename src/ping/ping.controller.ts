import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class PingController {
  private readonly logger = new Logger(PingController.name);

  @Get('ping')
  ping() {
    try {
      this.logger.log('Received ping request');
      return 'pong';
    } catch (error) {
      this.logger.error('Error handling ping:', error);
      throw error;
    }
  }
} 