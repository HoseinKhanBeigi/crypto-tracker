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
exports.BinanceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let BinanceService = class BinanceService {
    constructor() {
        this.BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';
    }
    async fetchBTCData(interval = '1m', limit = 500) {
        try {
            const response = await axios_1.default.get(this.BINANCE_API_URL, {
                params: {
                    symbol: 'BTCUSDT',
                    interval: interval,
                    limit: limit,
                },
            });
            return response.data.map((entry) => ({
                timestamp: entry[0],
                close: parseFloat(entry[4]),
            }));
        }
        catch (error) {
            console.error('Error fetching BTC data:', error);
            return [];
        }
    }
    computeDriftVolatility(data) {
        if (data.length < 2)
            return { mu: null, sigma: null };
        const returns = data
            .slice(1)
            .map((current, index) => (current.close - data[index].close) / data[index].close);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
        const stdDev = Math.sqrt(variance);
        return { mu: mean, sigma: stdDev };
    }
    solveFokkerPlanck(mu, sigma, S0, S_min, S_max, ns = 100, t_max = 0.083, dt = 0.002) {
        const dS = (S_max - S_min) / (ns - 1);
        const S = Array.from({ length: ns }, (_, i) => S_min + i * dS);
        let P = S.map(Si => Math.exp(-0.5 * Math.pow((Si - S0) / (S0 * 0.1), 2)) /
            (S0 * 0.1 * Math.sqrt(2 * Math.PI)));
        let P_sum = P.reduce((a, b) => a + b, 0) * dS;
        P = P.map(p => p / P_sum);
        const A = S.map(Si => mu * Si);
        const B = S.map(Si => Math.pow(sigma * Si, 2) / 2);
        for (let t = 0; t < t_max / dt; t++) {
            const newP = [...P];
            for (let i = 1; i < ns - 1; i++) {
                newP[i] = P[i] - dt * ((A[i] * (P[i + 1] - P[i - 1]) / (2 * dS)) -
                    (B[i] * (P[i + 1] - 2 * P[i] + P[i - 1]) / Math.pow(dS, 2)));
            }
            P = newP;
        }
        const finalSum = P.reduce((a, b) => a + b, 0) * dS;
        P = P.map(p => p / finalSum);
        const maxIdx = P.indexOf(Math.max(...P));
        const mostLikelyPrice = S[maxIdx];
        const mostLikelyProb = P[maxIdx] * 100;
        const priceChange = mostLikelyPrice - S0;
        let signal = 'HOLD';
        if (priceChange > 10 && mostLikelyProb > 5)
            signal = 'BUY';
        else if (priceChange < -10 && mostLikelyProb > 5)
            signal = 'SELL';
        const predictions = S.filter((_, i) => i % 10 === 0)
            .map((price, i) => ({
            price,
            probability: P[i * 10] * 100
        }));
        return {
            mostLikelyPrice,
            probability: mostLikelyProb,
            signal,
            currentPrice: S0,
            predictions
        };
    }
    async getStatistics(interval = '1m') {
        const btcData = await this.fetchBTCData(interval);
        const { mu, sigma } = this.computeDriftVolatility(btcData);
        if (mu === null || sigma === null) {
            return {
                drift: '0',
                volatility: '0',
                timestamp: new Date().toISOString()
            };
        }
        const currentPrice = btcData[btcData.length - 1].close;
        const tradingSignal = this.solveFokkerPlanck(mu, sigma, currentPrice, currentPrice * 0.8, currentPrice * 1.2);
        return {
            drift: mu.toFixed(6),
            volatility: sigma.toFixed(6),
            timestamp: new Date().toISOString(),
            tradingSignal
        };
    }
};
exports.BinanceService = BinanceService;
exports.BinanceService = BinanceService = __decorate([
    (0, common_1.Injectable)()
], BinanceService);
//# sourceMappingURL=binance.service.js.map