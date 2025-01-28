import { Module, forwardRef } from '@nestjs/common';
import { WebSocketGatewayService } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { MetricsModule } from '../metrics/metrics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [
    MetricsModule, 
    NotificationsModule, 
    forwardRef(() => TelegramModule)
  ],
  providers: [WebSocketGatewayService, WebSocketService],
  exports: [WebSocketService],
})
export class WebSocketModule {}
