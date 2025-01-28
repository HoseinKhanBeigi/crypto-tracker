"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TelegramService = class TelegramService {
    constructor() {
        this.botToken = '7909173256:AAF9M8mc0QYmtO9SUYQPv6XkrPkAz2P_ImU';
        this.telegramApiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async onModuleInit() {
        console.log('🤖 TelegramService initializing...');
        const webhookUrl = 'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
        try {
            await axios_1.default.post(`${this.telegramApiUrl}/deleteWebhook`);
            console.log('✅ Old webhook deleted');
        }
        catch (error) {
            console.error('❌ Error deleting webhook:', error.message);
        }
        await this.setWebhook(webhookUrl);
        try {
            const webhookInfo = await axios_1.default.get(`${this.telegramApiUrl}/getWebhookInfo`);
            console.log('📡 Current webhook info:', webhookInfo.data);
        }
        catch (error) {
            console.error('❌ Error getting webhook info:', error.message);
        }
    }
    async setWebhook(url) {
        try {
            const response = await axios_1.default.post(`${this.telegramApiUrl}/setWebhook`, {
                url,
                allowed_updates: ['message'],
            });
            console.log('🎯 Webhook set response:', response.data);
        }
        catch (error) {
            console.error('❌ Failed to set webhook:', error.message);
        }
    }
    async sendMessage(chatId, text) {
        try {
            const response = await axios_1.default.post(`${this.telegramApiUrl}/sendMessage`, {
                chat_id: chatId,
                text,
            });
            console.log('✉️ Message sent successfully:', response.data);
        }
        catch (error) {
            console.error('❌ Failed to send message:', error.message);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    }
    async sendMetricsUpdate(symbol, metrics, chatId) {
        console.log(`📊 Starting sendMetricsUpdate for ${symbol}...`);
        try {
            const message = `
📊 Metrics for ${symbol.toUpperCase()}:

Average Velocity: ${metrics.avgVelocity?.toFixed(2) || 'N/A'}
Standard Deviation: ${metrics.stdDev?.toFixed(2) || 'N/A'}
Min Price: ${metrics.min || 'N/A'}
Max Price: ${metrics.max || 'N/A'}
Price Range: ${metrics.range || 'N/A'}
`;
            const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID;
            console.log(`🔍 Using chat ID:`, targetChatId);
            if (!targetChatId) {
                console.error('❌ No chat ID available');
                return;
            }
            console.log(`📤 Attempting to send message to chat ${targetChatId}...`);
            await this.sendMessage(targetChatId, message);
            console.log(`✅ Metrics message sent successfully to chat ${targetChatId}`);
        }
        catch (error) {
            console.error('❌ Failed to send metrics update:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    }
    async handleStartCommand(chatId) {
        console.log('🎬 Handling /start command for chat:', chatId);
        const message = `Welcome! You will receive crypto metrics updates in this chat.`;
        await this.sendMessage(chatId, message);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map