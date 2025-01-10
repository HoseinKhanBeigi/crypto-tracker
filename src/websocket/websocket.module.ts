import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { MetricsModule } from '../metrics/metrics.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MetricsModule, NotificationsModule],
  providers: [WebSocketGatewayService, WebSocketService],
})
export class WebSocketModule {}
