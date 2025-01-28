import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any): Promise<void> {
    console.log('Received update:', update);

    const message = update.message?.text; // Extract message text
    const chatId = update.message?.chat.id; // Extract chat ID

    if (message && chatId) {
      if (message.startsWith('/start')) {
        await this.telegramService.sendMessage(
          chatId,
          'Welcome to your Telegram bot!',
        );
      } else {
        await this.telegramService.sendMessage(chatId, `You said: ${message}`);
      }
    }
  }
}
