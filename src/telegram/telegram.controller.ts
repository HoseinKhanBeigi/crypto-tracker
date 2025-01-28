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
    console.log('🔍 Received webhook update:', JSON.stringify(update, null, 2));

    try {
      if (update.message?.text) {
        const chatId = update.message.chat.id;
        // Add more detailed logging
        console.log('💬 Message details:', {
          chatId: chatId,
          type: typeof chatId,
          text: update.message.text,
          from: update.message.from,
          chat: update.message.chat
        });

        const text = update.message.text.toLowerCase();
        
        // Handle different commands
        switch (text) {
          case '/start':
            this.logger.log('🎬 Received /start command');
            
            try {
              // Send welcome message
              await this.telegramService.handleStartCommand(chatId);
              console.log('✅ Welcome message sent successfully');

              // Get real metrics from WebSocket service
              const metrics = this.webSocketService.getLatestMetrics();
              console.log('📊 Got metrics:', metrics);
              
              if (metrics) {
                await this.telegramService.sendMetricsUpdate('btcusdt', metrics, chatId);
                console.log('✅ Metrics sent successfully');
              }
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
            console.log('📊 Got metrics:', metrics);
            
            if (metrics) {
              await this.telegramService.sendMetricsUpdate('btcusdt', metrics, chatId);
              console.log('✅ Metrics sent successfully');
            } else {
              await this.telegramService.sendMessage(chatId, 'No metrics available yet. Please wait a moment and try again.');
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
        timestamp: new Date().toISOString()
      };
    }
  }
}
