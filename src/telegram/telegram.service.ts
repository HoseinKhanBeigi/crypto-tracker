import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;

  async onModuleInit() {
    try {
      // Set up webhook
      const webhookUrl =
        'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
      await this.setWebhook(webhookUrl);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  // Set the Telegram bot webhook
  private async setWebhook(url: string): Promise<void> {
    try {
      const response = await axios.post(`${this.telegramApiUrl}/setWebhook`, {
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

      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: numericChatId,
        text,
      });
    } catch (error) {
      console.error('❌ Failed to send message:', error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Request data:', {
          chat_id: chatId,
          text: text.substring(0, 100) + '...', // Log first 100 chars of message
        });
      }
    }
  }

  // Add new method for sending metrics
  async sendMetricsUpdate(
    symbol: string,
    metrics: any,
    chatId: string | number,
    price: any,
  ): Promise<void> {
    if (!chatId) {
      console.error('❌ No chat ID provided');
      return;
    }

    try {
      const message = `
📊 ${symbol.toUpperCase()} Update:
 Current Price: $${price}
📈 Avg Velocity: $${metrics.avgVelocity}
`;
      await this.sendMessage(193418752, message);
    } catch (error) {
      console.error('❌ Failed to send metrics update:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }

  // Modify the existing handleStartCommand to include metrics info
  async handleStartCommand(chatId: string | number): Promise<void> {
    const message = `Welcome! You will receive crypto metrics updates in this chat.`;
    await this.sendMessage(193418752, message);
  }
}
