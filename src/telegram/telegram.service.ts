import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
  private readonly defaultChatId = 'YOUR_CHAT_ID_HERE'; // Add this after you get your chat ID

  async onModuleInit() {
    console.log('🤖 TelegramService initializing...');
    
    // First, delete existing webhook and get updates
    try {
      await axios.post(`${this.telegramApiUrl}/deleteWebhook`);
      console.log('✅ Old webhook deleted');
      
      // Get any pending updates to see chat ID
      const updates = await axios.get(`${this.telegramApiUrl}/getUpdates`);
      console.log('📱 Updates:', JSON.stringify(updates.data, null, 2));
      
      // Then set up your webhook
      const webhookUrl = 'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
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
      console.log('🎯 Webhook set response:', response.data);
    } catch (error) {
      console.error('❌ Failed to set webhook:', error.message);
    }
  }

  // Send a message to a chat
  async sendMessage(chatId: string | number, text: string): Promise<void> {
    try {
      const response = await axios.post(`${this.telegramApiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
      });
      console.log('✉️ Message sent successfully:', response.data);
    } catch (error) {
      console.error('❌ Failed to send message:', error.message);
      // Log more details about the error
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }

  // Add new method for sending metrics
  async sendMetricsUpdate(symbol: string, metrics: any, chatId?: string | number): Promise<void> {
    console.log(metrics);
    try {
      const message = `
📊 Metrics for ${symbol.toUpperCase()}:

Average Velocity: ${metrics.avgVelocity}
Standard Deviation: ${metrics.stdDev}
Min Price: ${metrics.min}
Max Price: ${metrics.max}
Price Range: ${metrics.range}
`;

      // Use provided chatId, or defaultChatId, or environment variable
      const targetChatId = chatId || this.defaultChatId || process.env.TELEGRAM_CHAT_ID;
      console.log(`🔍 Using chat ID:`, targetChatId);

      if (!targetChatId) {
        console.error('❌ No chat ID available');
        return;
      }

      console.log(`📤 Attempting to send message to chat ${targetChatId}...`);
      await this.sendMessage(targetChatId, message);
      console.log(`✅ Metrics message sent successfully to chat ${targetChatId}`);
    } catch (error) {
      console.error('❌ Failed to send metrics update:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  }

  // Modify the existing handleStartCommand to include metrics info
  async handleStartCommand(chatId: string | number): Promise<void> {
    console.log('🎬 Handling /start command for chat:', chatId);
    const message = `Welcome! You will receive crypto metrics updates in this chat.`;
    await this.sendMessage(chatId, message);
  }
}
