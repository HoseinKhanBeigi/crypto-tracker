import { Controller, Post, Body, Logger, Req } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { MetricsService } from '../metrics/metrics.service';
import { WebSocketService } from '../websocket/websocket.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly metricsService: MetricsService,
    private readonly webSocketService: WebSocketService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any, @Req() req: any) {
    // Add detailed logging of the update object

    try {
      if (update.message?.text) {
        const chatId = update.message.chat.id;
        console.log(chatId,"chatId");
        // Add more detailed logging

        const text = update.message.text.toLowerCase();

        // Handle different comm dands
        switch (text) {
          case '/start':
            this.logger.log('🎬 Received /start command');

            try {
              // Send welcome message
              await this.telegramService.handleStartCommand(193418752);

              // Get real metrics from WebSocket service
              const metrics = this.webSocketService.getLatestMetrics();
            } catch (error) {
              console.error('❌ Error sending messages:', error);
              if (error.response) {
                console.error('Error response:', error.response.data);
              }
            }

            return { ok: true, message: 'Start command and metrics sent' };

          case '/metrics':
          case 'metrics':
            // Get real metrics from WebSocket service
            const metrics = this.webSocketService.getLatestMetrics();

            if (metrics) {
            } else {
              await this.telegramService.sendMessage(
                chatId,
                'No metrics available yet. Please wait a moment and try again.',
              );
            }
            break;
        }

        return { ok: true, message: 'Command handled successfully' };
      }
      return { ok: true, message: 'Webhook received' };
    } catch (error) {
      this.logger.error('❌ Error handling webhook:', error);
      return {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
