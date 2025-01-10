import { Module } from '@nestjs/common';
import { WebSocketModule } from './websocket/websocket.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [WebSocketModule, MetricsModule, NotificationsModule],
})
export class AppModule {}
