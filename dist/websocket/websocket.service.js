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
function formatToInteger(price) {
    if (price >= 1) {
        return price;
    }
    else if (price > 0.0001) {
        return Math.round(price * 1_000_0);
    }
    else {
        return Math.round(price * 100_000_000);
    }
}
let WebSocketService = class WebSocketService {
    constructor(metricsService, notificationsService, gateway) {
        this.metricsService = metricsService;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
        this.binanceWs = null;
        this.symbols = ['btcusdt', 'ethusdt', 'adausdt'];
        this.coinData = {};
        this.timestamps = {};
        this.reconnectDelay = 5000;
    }
    onModuleInit() {
        this.connectToBinance();
    }
    onModuleDestroy() {
        this.disconnectFromBinance();
    }
    connectToBinance() {
        const streamNames = this.symbols
            .map((symbol) => `${symbol}@trade`)
            .join('/');
        const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;
        console.log(`Attempting to connect to Binance WebSocket: ${url}`);
        this.binanceWs = new ws_1.default(url);
        this.binanceWs.on('open', () => {
            console.log('Connected to Binance WebSocket.');
        });
        this.binanceWs.on('message', (data) => {
            this.handleMessage(data.toString());
        });
        this.binanceWs.on('error', (err) => {
            console.error('Binance WebSocket Error:', err.message);
        });
        this.binanceWs.on('close', (code, reason) => {
            console.warn(`Binance WebSocket closed. Code: ${code}, Reason: ${reason}`);
            this.scheduleReconnect();
        });
    }
    disconnectFromBinance() {
        if (this.binanceWs) {
            this.binanceWs.close();
            console.log('Disconnected from Binance WebSocket.');
        }
    }
    scheduleReconnect() {
        console.log(`Reconnecting to Binance WebSocket in ${this.reconnectDelay / 1000} seconds...`);
        setTimeout(() => {
            this.connectToBinance();
        }, this.reconnectDelay);
    }
    handleMessage(message) {
        const parsed = JSON.parse(message);
        const stream = parsed.stream;
        const symbol = stream.split('@')[0];
        const trade = parsed.data;
        const price = parseFloat(trade.p);
        if (isNaN(price))
            return;
        const formattedPrice = formatToInteger(price);
        const now = Date.now();
        if (!this.coinData[symbol]) {
            this.coinData[symbol] = [];
            this.timestamps[symbol] = now;
        }
        if (now - this.timestamps[symbol] >= 1000) {
            this.timestamps[symbol] = now;
            this.coinData[symbol].push(formattedPrice);
            if (this.coinData[symbol].length >= 60) {
                const metrics = this.metricsService.calculateMetrics(this.coinData[symbol]);
                console.log(`Metrics for ${symbol.toUpperCase()}:`, metrics);
                if (Math.abs(metrics.avgVelocity) > 8) {
                    this.notificationsService.sendLocalNotification(symbol, metrics.avgVelocity);
                }
                this.gateway.broadcast('price', { symbol, formattedPrice });
                this.coinData[symbol] = [];
            }
        }
    }
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService,
        notifications_service_1.NotificationsService,
        websocket_gateway_1.WebSocketGatewayService])
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map