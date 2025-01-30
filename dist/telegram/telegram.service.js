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
        try {
            const webhookUrl = 'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app/telegram/webhook';
            await this.setWebhook(webhookUrl);
        }
        catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
    async setWebhook(url) {
        try {
            const response = await axios_1.default.post(`${this.telegramApiUrl}/setWebhook`, {
                url,
                allowed_updates: ['message'],
            });
        }
        catch (error) {
            console.error('❌ Failed to set webhook:', error.message);
        }
    }
    async sendMessage(chatId, text) {
        try {
            const numericChatId = Number(chatId);
            if (isNaN(numericChatId)) {
                console.error('❌ Invalid chat ID:', chatId);
                return;
            }
            const response = await axios_1.default.post(`${this.telegramApiUrl}/sendMessage`, {
                chat_id: numericChatId,
                text,
            });
        }
        catch (error) {
            console.error('❌ Failed to send message:', error.message);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Request data:', {
                    chat_id: chatId,
                    text: text.substring(0, 100) + '...',
                });
            }
        }
    }
    async sendMetricsUpdate(symbol, metrics, chatId, price) {
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
        }
        catch (error) {
            console.error('❌ Failed to send metrics update:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    }
    async handleStartCommand(chatId) {
        const message = `Welcome! You will receive crypto metrics updates in this chat.`;
        await this.sendMessage(193418752, message);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map