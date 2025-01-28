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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = __importDefault(require("ws"));
const metrics_service_1 = require("../metrics/metrics.service");
const notifications_service_1 = require("../notifications/notifications.service");
const websocket_gateway_1 = require("./websocket.gateway");
const telegram_service_1 = require("../telegram/telegram.service");
let WebSocketService = class WebSocketService {
    constructor(metricsService, notificationsService, gateway, telegramService) {
        this.metricsService = metricsService;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
        this.telegramService = telegramService;
        this.symbols = ['btcusdt', 'dogeusdt', 'xrpusdt'];
        this.coinData = {};
        this.timestamps = {};
        this.latestMetrics = {};
    }
    onModuleInit() {
        this.connectToBinance();
    }
    connectToBinance() {
        const streamNames = this.symbols
            .map((symbol) => `${symbol}@trade`)
            .join('/');
        const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;
        console.log(`🔌 Connecting to Binance WebSocket: ${url}`);
        this.binanceWs = new ws_1.default(url);
        this.binanceWs.on('open', () => {
            console.log('✅ Connected to Binance WebSocket');
        });
        this.binanceWs.on('message', async (data) => {
            const parsed = JSON.parse(data.toString());
            const stream = parsed.stream;
            const symbol = stream.split('@')[0];
            const trade = parsed.data;
            const price = parseFloat(trade.p);
            if (isNaN(price))
                return;
            const formattedPrice = this.metricsService.formatToInteger(price);
            const now = Date.now();
            if (!this.coinData[symbol]) {
                this.coinData[symbol] = [];
                this.timestamps[symbol] = now;
            }
            if (now - this.timestamps[symbol] >= 1000) {
                this.timestamps[symbol] = now;
                this.coinData[symbol].push(formattedPrice);
                if (this.coinData[symbol].length >= 5) {
                    console.log(`🧮 Calculating metrics for ${symbol}...`);
                    const metrics = this.metricsService.calculateMetrics(this.coinData[symbol]);
                    this.latestMetrics[symbol] = metrics;
                    try {
                        console.log(`📤 Sending metrics to Telegram for ${symbol}...`);
                        await this.telegramService.sendMetricsUpdate(symbol, metrics);
                        console.log(`✅ Metrics sent to Telegram successfully`);
                    }
                    catch (error) {
                        console.error(`❌ Failed to send metrics to Telegram:`, error);
                    }
                    this.gateway.broadcast('price', { symbol, formattedPrice });
                    this.coinData[symbol] = [];
                    console.log(`🔄 Reset data collection for ${symbol}`);
                }
            }
        });
        this.binanceWs.on('error', (err) => {
            console.error('❌ Binance WebSocket Error:', err.message);
        });
        this.binanceWs.on('close', () => {
            console.log('🔄 Binance WebSocket closed. Reconnecting...');
            setTimeout(() => this.connectToBinance(), 5000);
        });
    }
    onModuleDestroy() {
        if (this.binanceWs) {
            console.log('👋 Closing Binance WebSocket connection...');
            this.binanceWs.close();
        }
    }
    getLatestMetrics(symbol = 'btcusdt') {
        return this.latestMetrics[symbol] || {
            avgVelocity: 0,
            stdDev: 0,
            min: 0,
            max: 0,
            range: 0
        };
    }
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService,
        notifications_service_1.NotificationsService,
        websocket_gateway_1.WebSocketGatewayService,
        telegram_service_1.TelegramService])
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map