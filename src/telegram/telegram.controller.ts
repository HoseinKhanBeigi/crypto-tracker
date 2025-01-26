import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleUpdate(@Body() update: any): Promise<void> {
    console.log('Received update:', update);

    const message = update.message?.text; // Extract the message text
    const chatId = update.message?.chat.id; // Extract the chat ID

    if (message && chatId) {
      // Respond to a simple "/start" command
      if (message.startsWith('/start')) {
        await this.telegramService.sendMessage(
          chatId,
          'Welcome to your new Telegram bot!',
        );
      } else {
        // Echo back any other message
        await this.telegramService.sendMessage(chatId, `You said: ${message}`);
      }
    }
  }
}
