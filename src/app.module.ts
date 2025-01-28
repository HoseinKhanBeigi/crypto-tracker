import { Module } from '@nestjs/common';
import { WebSocketModule } from './websocket/websocket.module';
import { MetricsModule } from './metrics/metrics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TelegramModule } from './telegram/telegram.module';
import { PingService } from './ping.service';
import { PingController } from './ping/ping.controller';

@Module({
  imports: [
    WebSocketModule,
    MetricsModule,
    NotificationsModule,
    TelegramModule,
  ],
  controllers: [PingController],
  providers: [PingService],
})
export class AppModule {}
