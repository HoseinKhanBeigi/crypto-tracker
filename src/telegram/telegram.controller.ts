import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    // Check if it's a message and contains text
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // Handle /start command
      if (text === '/start') {
        await this.telegramService.handleStartCommand(chatId);
      }
    }
    return { ok: true };
  }
}
