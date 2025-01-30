import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;

  async onModuleInit() {
    console.log('🤖 TelegramService initializing...');

    try {
      // Set up webhook
      const webhookUrl =
        'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
      await this.setWebhook(webhookUrl);
      console.log('✅ Webhook set up successfully');
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
      console.log('🎯 Webhook set response:', response.data);
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

      console.log(`📤 Attempting to send message to chat ${numericChatId}`);
      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: numericChatId,
        text,
      });
      console.log('✉️ Message sent successfully:', response.data);
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
  ): Promise<void> {
    if (!chatId) {
      console.error('❌ No chat ID provided');
      return;
    }

    try {
      const message = `
📊 ${symbol.toUpperCase()} Update:
📈 Avg Velocity: $${(metrics.avgVelocity / 100).toFixed(2)}
🚀 Avg Acceleration: $${(metrics.avgAcceleration / 100).toFixed(2)}
💫 Avg Jerk: $${(metrics.avgJerk / 100).toFixed(2)}
📊 Total Velocity: $${(metrics.totalVelocity / 100).toFixed(2)}
`;

      console.log('📤 Sending formatted message:', message);
      await this.sendMessage(193418752, message);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send metrics update:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }

  // Modify the existing handleStartCommand to include metrics info
  async handleStartCommand(chatId: string | number): Promise<void> {
    console.log('🎬 Handling /start command for chat:', 193418752);
    const message = `Welcome! You will receive crypto metrics updates in this chat.`;
    await this.sendMessage(193418752, message);
  }
}
