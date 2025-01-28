"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TelegramController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const metrics_service_1 = require("../metrics/metrics.service");
const websocket_service_1 = require("../websocket/websocket.service");
let TelegramController = TelegramController_1 = class TelegramController {
    constructor(telegramService, metricsService, webSocketService) {
        this.telegramService = telegramService;
        this.metricsService = metricsService;
        this.webSocketService = webSocketService;
        this.logger = new common_1.Logger(TelegramController_1.name);
    }
    async handleWebhook(update, req) {
        console.log('🔍 Received webhook update:', JSON.stringify(update, null, 2));
        try {
            if (update.message?.text) {
                const chatId = update.message.chat.id;
                console.log('💬 Message details:', {
                    chatId: chatId,
                    type: typeof chatId,
                    text: update.message.text,
                    from: update.message.from,
                    chat: update.message.chat
                });
                const text = update.message.text.toLowerCase();
                switch (text) {
                    case '/start':
                        this.logger.log('🎬 Received /start command');
                        try {
                            await this.telegramService.handleStartCommand(193418752);
                            console.log('✅ Welcome message sent successfully');
                            const metrics = this.webSocketService.getLatestMetrics();
                            console.log('📊 Got metrics:', metrics);
                            if (metrics) {
                                await this.telegramService.sendMetricsUpdate('btcusdt', metrics, 193418752);
                                console.log('✅ Metrics sent successfully');
                            }
                        }
                        catch (error) {
                            console.error('❌ Error sending messages:', error);
                            if (error.response) {
                                console.error('Error response:', error.response.data);
                            }
                        }
                        return { ok: true, message: 'Start command and metrics sent' };
                    case '/metrics':
                    case 'metrics':
                        const metrics = this.webSocketService.getLatestMetrics();
                        console.log('📊 Got metrics:', metrics);
                        if (metrics) {
                            await this.telegramService.sendMetricsUpdate('btcusdt', metrics, 193418752);
                            console.log('✅ Metrics sent successfully');
                        }
                        else {
                            await this.telegramService.sendMessage(chatId, 'No metrics available yet. Please wait a moment and try again.');
                        }
                        break;
                }
                return { ok: true, message: 'Command handled successfully' };
            }
            return { ok: true, message: 'Webhook received' };
        }
        catch (error) {
            this.logger.error('❌ Error handling webhook:', error);
            return {
                ok: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "handleWebhook", null);
exports.TelegramController = TelegramController = TelegramController_1 = __decorate([
    (0, common_1.Controller)('telegram'),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService,
        metrics_service_1.MetricsService,
        websocket_service_1.WebSocketService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map