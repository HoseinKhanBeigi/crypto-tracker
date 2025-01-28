import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    this.logger.log('📥 Received webhook update:', JSON.stringify(update, null, 2));

    try {
      if (update.message?.text) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        
        this.logger.log(`📝 Received message: "${text}" from chat ID: ${chatId}`);

        if (text === '/start') {
          this.logger.log('🎬 Received /start command');
          await this.telegramService.handleStartCommand(chatId);
        }
      }
      return { ok: true };
    } catch (error) {
      this.logger.error('❌ Error handling webhook:', error);
      throw error;
    }
  }
}
