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
    // Add this line to see the full update object
    console.log('Full update object:', JSON.stringify(update, null, 2));

    // Log the entire request
    this.logger.log('Headers:', req.headers);
    this.logger.log('Raw Body:', req.rawBody);
    this.logger.log('Parsed Body:', update);

    try {
      if (update.message?.text) {
        const chatId = update.message.chat.id;
        console.log('📱 Chat ID:', chatId);
        const text = update.message.text;
        
        this.logger.log(`📝 Received message: "${text}" from chat ID: ${chatId}`);

        if (text === '/start') {
          this.logger.log('🎬 Received /start command');
          
          // Send welcome message
          await this.telegramService.handleStartCommand(chatId);

          // Get real metrics from WebSocket service
          const metrics = this.webSocketService.getLatestMetrics();
          if (metrics) {
            await this.telegramService.sendMetricsUpdate('btcusdt', metrics, chatId);
          }
          
          return { ok: true, message: 'Start command and metrics sent' };
        }
      }
      return { ok: true, message: 'Webhook received' };
    } catch (error) {
      this.logger.error('❌ Error handling webhook:', error);
      // Return error response instead of throwing
      return { 
        ok: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
