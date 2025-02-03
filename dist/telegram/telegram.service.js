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
        this.chatIds = [193418752, 247671667, 248797966, 104883495];
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
            await axios_1.default.post(`${this.telegramApiUrl}/setWebhook`, {
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
            await axios_1.default.post(`${this.telegramApiUrl}/sendMessage`, {
                chat_id: numericChatId,
                text,
            });
        }
        catch (error) {
            console.error(`❌ Failed to send to ${chatId}:`, error.message);
        }
    }
    async sendMetricsUpdate(symbol, metrics, _chatId, price) {
        const message = `
📊 ${symbol.toUpperCase()} Update:
 Current Price: $${price}
📈 Avg Velocity: $${metrics.avgVelocity}
`;
        for (const chatId of this.chatIds) {
            try {
                await this.sendMessage(chatId, message);
            }
            catch (error) {
                console.error(`❌ Failed to send to chat ${chatId}:`, error.message);
            }
        }
    }
    async handleStartCommand(chatId) {
        const message = `Welcome! You will receive crypto metrics updates in this chat.`;
        for (const id of this.chatIds) {
            await this.sendMessage(id, message);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)()
], TelegramService);
//# sourceMappingURL=telegram.service.js.map