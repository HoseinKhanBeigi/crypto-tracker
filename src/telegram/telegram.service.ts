import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU'; // Your BotFather token
  private readonly telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;

  async onModuleInit() {
    console.log('🤖 TelegramService initializing...');
    // Make sure this URL matches your actual Vercel deployment URL
    const webhookUrl = 'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
    
    // First, delete any existing webhook
    try {
      await axios.post(`${this.telegramApiUrl}/deleteWebhook`);
      console.log('✅ Old webhook deleted');
    } catch (error) {
      console.error('❌ Error deleting webhook:', error.message);
    }

    // Set new webhook
    await this.setWebhook(webhookUrl);
    
    // Verify webhook
    try {
      const webhookInfo = await axios.get(`${this.telegramApiUrl}/getWebhookInfo`);
      console.log('📡 Current webhook info:', webhookInfo.data);
    } catch (error) {
      console.error('❌ Error getting webhook info:', error.message);
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
    console.log(`📊 Starting sendMetricsUpdate for ${symbol}...`);
    try {
      const message = `
📊 Metrics for ${symbol.toUpperCase()}:

Average Velocity: ${metrics.avgVelocity || 'N/A'}
Standard Deviation: ${metrics.stdDev || 'N/A'}
Min Price: ${metrics.min || 'N/A'}
Max Price: ${metrics.max || 'N/A'}
Price Range: ${metrics.range || 'N/A'}
`;

      // Use provided chatId or fall back to environment variable
      const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;
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
