import { Injectable, OnModuleInit } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;

  async onModuleInit() {
    console.log('TelegramService initialized!');
    // Set webhook here if needed
    const webhookUrl =
      'https://crypto-tracker-gamma-two.vercel.app/telegram/webhook';
    await this.setWebhook(webhookUrl);
  }

  // Set the Telegram bot webhook
  private async setWebhook(url: string): Promise<void> {
    await axios.post(`${this.telegramApiUrl}/setWebhook`, {
      url,
    });
    console.log(`Webhook set to: ${url}`);
  }

  // Send a message to a chat
  async sendMessage(chatId: string | number, text: string): Promise<void> {
    await axios.post(`${this.telegramApiUrl}/sendMessage`, {
      chat_id: chatId,
      text,
    });
  }
}
