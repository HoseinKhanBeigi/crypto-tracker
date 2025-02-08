import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  private readonly chatIds = [
    193418752, 247671667, 248797966, 104883495, 108920302, 5535999915,
  ]; // All chat IDs

  async onModuleInit() {
    try {
      // Set up webhook
      const webhookUrl =
        'https://real-time-cryptoprise.vercel.app/telegram/webhook';
      await this.setWebhook(webhookUrl);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // afsane 247671667
  // melika 248797966

  // Set the Telegram bot webhook
  private async setWebhook(url: string): Promise<void> {
    try {
      await axios.post(`${this.telegramApiUrl}/setWebhook`, {
        url,
        allowed_updates: ['message'],
      });
    } catch (error) {
      console.error('❌ Failed to set webhook:', error.message);
    }
  }

  // Send a message to a chat
  async sendMessage(chatId: string | number, text: string): Promise<void> {
    try {
      // Ensure chatId is a number
      const numericChatId = Number(chatId);
      if (isNaN(numericChatId)) {
        console.error('❌ Invalid chat ID:', chatId);
        return;
      }

      await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: numericChatId,
        text,
      });
    } catch (error) {
      console.error(`❌ Failed to send to ${chatId}:`, error.message);
    }
  }

  // Modify the existing handleStartCommand to include metrics info
  async handleStartCommand(chatId: string | number): Promise<void> {
    const message = `Welcome! You will receive crypto metrics updates in this chat.`;
    // Send welcome message to all chat IDs
    for (const id of this.chatIds) {
      await this.sendMessage(id, message);
    }
  }
}
