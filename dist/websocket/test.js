"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let WebSocketService = class WebSocketService {
    constructor(metricsService, notificationsService, gateway) {
        this.metricsService = metricsService;
        this.notificationsService = notificationsService;
        this.gateway = gateway;
        this.symbols = [
            'btcusdt',
            'dogeusdt',
            'xrpusdt',
            'rsrusdt',
            'pnutusdt',
            'adausdt',
            'galausdt',
            'egldusdt',
            'dotusdt',
            'grtusdt',
            'uniusdt',
            'sklusdt',
            'cakeusdt',
            'vetusdt',
            'solusdt',
            'cotiusdt',
            'icpusdt',
            'cfxusdt',
            'polusdt',
            'zetausdt',
            'sushiusdt',
            'bobusdt',
            'peopleusdt',
            'arbusdt',
            'shibusdt',
            'flokiusdt',
            'pepeusdt',
            '1mbabydogeusdt',
        ];
        this.coinData = {};
        this.timestamps = {};
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
        this.binanceWs = new ws_1.default(url);
        this.binanceWs.on('open', () => {
            console.log('Connected to Binance WebSocket.');
        });
        this.binanceWs.on('message', (data) => {
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
                    const metrics = this.metricsService.calculateMetrics(this.coinData[symbol]);
                    const freq = this.metricsService.classifyFrequency(this.coinData[symbol]);
                    console.log(`Metrics for ${symbol.toUpperCase()}:`, metrics);
                    if (Math.abs(metrics.avgVelocity) > 4.5) {
                        this.notificationsService.sendLocalNotification(symbol, metrics.avgVelocity);
                    }
                    this.gateway.broadcast('price', { symbol, formattedPrice });
                    this.coinData[symbol] = [];
                }
            }
        });
        this.binanceWs.on('error', (err) => {
            console.error('Binance WebSocket Error:', err.message);
        });
        this.binanceWs.on('close', () => {
            console.log('Binance WebSocket closed. Reconnecting...');
            setTimeout(() => this.connectToBinance(), 5000);
        });
    }
    disconnectFromBinance() {
        if (this.binanceWs) {
            this.binanceWs.close();
            console.log('Disconnected from Binance WebSocket.');
        }
    }
    saveMetricsToFile(symbol, metrics, freq) {
        const logFilePath = path.join(__dirname, '..', '..', 'logs', `${symbol}-metrics.json`);
        const logData = {
            timestamp: new Date().toISOString(),
            metrics,
            freq,
        };
        try {
            fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
            fs.appendFileSync(logFilePath, JSON.stringify(logData) + '\n', 'utf-8');
        }
        catch (error) {
            console.error('Error saving metrics to file:', error.message);
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
//# sourceMappingURL=test.js.map