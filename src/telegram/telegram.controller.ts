import { Controller, Post, Body, Logger, Req } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any, @Req() req: any) {
    // Log the entire request
    this.logger.log('Headers:', req.headers);
    this.logger.log('Raw Body:', req.rawBody);
    this.logger.log('Parsed Body:', update);

    try {
      if (update.message?.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        this.logger.log(`📝 Received message: "${text}" from chat ID: ${chatId}`);

        if (text === '/start') {
          this.logger.log('🎬 Received /start command');
          await this.telegramService.handleStartCommand(chatId);
          return { ok: true, message: 'Start command handled' };
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
