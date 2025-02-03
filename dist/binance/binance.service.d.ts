interface PriceData {
    timestamp: number;
    close: number;
}
interface Statistics {
    mu: number | null;
    sigma: number | null;
}
interface TradingSignal {
    mostLikelyPrice: number;
    probability: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
    currentPrice: number;
    predictions: Array<{
        price: number;
        probability: number;
    }>;
}
export declare class BinanceService {
    private readonly BINANCE_API_URL;
    fetchBTCData(interval?: string, limit?: number): Promise<PriceData[]>;
    computeDriftVolatility(data: PriceData[]): Statistics;
    solveFokkerPlanck(mu: number, sigma: number, S0: number, S_min: number, S_max: number, ns?: number, t_max?: number, dt?: number): TradingSignal;
    getStatistics(interval?: string): Promise<{
        drift: string;
        volatility: string;
        timestamp: string;
        tradingSignal?: TradingSignal;
    }>;
}
export {};
