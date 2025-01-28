import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { MetricsModule } from '../metrics/metrics.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    MetricsModule,
    forwardRef(() => WebSocketModule),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
