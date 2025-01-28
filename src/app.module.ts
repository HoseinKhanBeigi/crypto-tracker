import { Module } from '@nestjs/common';
import { WebSocketModule } from './websocket/websocket.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { telegramModule } from './telegram/telegram.module';

@Module({
  imports: [
    WebSocketModule,
    MetricsModule,
    NotificationsModule,
    telegramModule,
  ],
})
export class AppModule {}
