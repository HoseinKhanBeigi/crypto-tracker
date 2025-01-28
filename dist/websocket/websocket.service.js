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
        this.symbols = ['btcusdt'];
        this.coinData = {};
        this.timestamps = {};
        this.latestMetrics = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    onModuleInit() {
        this.connectToBinance();
    }
    connectToBinance() {
        const streamNames = this.symbols
            .map((symbol) => `${symbol}@trade`)
            .join('/');
        const endpoints = [
            `wss://stream.binance.com:9443/stream?streams=${streamNames}`,
            `wss://stream.binance.com:9443/stream?streams=${streamNames}`,
        ];
        const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;
        const endpoint = endpoints[this.reconnectAttempts % endpoints.length];
        console.log(`🔌 Connecting to Binance WebSocket: ${endpoint}`);
        try {
            this.binanceWs = new ws_1.default(endpoint, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000,
            });
            this.binanceWs.on('open', () => {
                console.log('✅ Connected to Binance WebSocket');
            });
            this.binanceWs.on('message', async (data) => {
                try {
                    const parsed = JSON.parse(data.toString());
                    if (!parsed.data)
                        return;
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
                        if (this.coinData[symbol].length >= 20) {
                            const metrics = this.metricsService.calculateMetrics(this.coinData[symbol]);
                            this.latestMetrics[symbol] = metrics;
                            try {
                                const message = `
📊 ${symbol.toUpperCase()} Update:
💰 Current Price: $${price}
📈 Velocity: $${metrics.avgVelocity.toFixed(2)}
🚀 Acceleration: $${metrics.avgAcceleration.toFixed(2)}
💫 Jerk: $${metrics.avgJerk.toFixed(2)}
`;
                                console.log(`📤 Sending to Telegram:`, message);
                                await this.telegramService.sendMetricsUpdate(symbol, metrics, 193418752);
                            }
                            catch (error) {
                                console.error(`❌ Failed to send to Telegram:`, error);
                            }
                            this.coinData[symbol] = [];
                            console.log(`🔄 Reset data collection for ${symbol}`);
                        }
                    }
                }
                catch (error) {
                    console.error('❌ Error:', error);
                }
            });
            this.binanceWs.on('error', (err) => {
                console.error('❌ Binance WebSocket Error:', err.message);
                this.reconnectAttempts++;
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    setTimeout(() => this.connectToBinance(), 5000 * this.reconnectAttempts);
                }
                else {
                    console.error('❌ Max reconnection attempts reached');
                }
            });
            this.binanceWs.on('close', () => {
                console.log('🔄 Binance WebSocket closed.');
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                    setTimeout(() => this.connectToBinance(), 5000 * this.reconnectAttempts);
                }
            });
        }
        catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            this.reconnectAttempts++;
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.connectToBinance(), 5000 * this.reconnectAttempts);
            }
        }
    }
    onModuleDestroy() {
        if (this.binanceWs) {
            console.log('👋 Closing Binance WebSocket connection...');
            this.binanceWs.close();
        }
    }
    getLatestMetrics(symbol = 'btcusdt') {
        return this.latestMetrics[symbol];
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