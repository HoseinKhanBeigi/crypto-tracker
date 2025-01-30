import { Controller, Get } from '@nestjs/common';
import { WebSocketService } from '../websocket/websocket.service';

@Controller('health')
export class HealthController {
  constructor(private webSocketService: WebSocketService) {}

  @Get()
  async check() {
    return {
      status: 'ok',
      websocket: this.webSocketService.isConnected(),
      timestamp: new Date().toISOString()
    };
  }
} 