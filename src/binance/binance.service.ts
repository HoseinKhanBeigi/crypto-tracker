import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
  predictions: Array<{ price: number; probability: number }>;
}

@Injectable()
export class BinanceService {
  private readonly BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

  async fetchBTCData(interval = '1m', limit = 500): Promise<PriceData[]> {
    try {
      const response = await axios.get(this.BINANCE_API_URL, {
        params: {
          symbol: 'BTCUSDT',
          interval: interval,
          limit: limit,
        },
      });

      return response.data.map((entry: any) => ({
        timestamp: entry[0],
        close: parseFloat(entry[4]),
      }));
    } catch (error) {
      console.error('Error fetching BTC data:', error);
      return [];
    }
  }

  computeDriftVolatility(data: PriceData[]): Statistics {
    if (data.length < 2) return { mu: null, sigma: null };

    const returns = data
      .slice(1)
      .map((current, index) => 
        (current.close - data[index].close) / data[index].close
      );

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => 
      sum + Math.pow(r - mean, 2), 0
    ) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);

    return { mu: mean, sigma: stdDev };
  }

  solveFokkerPlanck(
    mu: number,
    sigma: number,
    S0: number,
    S_min: number,
    S_max: number,
    ns = 100,
    t_max = 0.083,
    dt = 0.002
  ): TradingSignal {
    const dS = (S_max - S_min) / (ns - 1);
    const S = Array.from({ length: ns }, (_, i) => S_min + i * dS);

    // Initial probability distribution
    let P = S.map(Si => 
      Math.exp(-0.5 * Math.pow((Si - S0) / (S0 * 0.1), 2)) / 
      (S0 * 0.1 * Math.sqrt(2 * Math.PI))
    );
    
    let P_sum = P.reduce((a, b) => a + b, 0) * dS;
    P = P.map(p => p / P_sum);

    // Compute coefficients
    const A = S.map(Si => mu * Si);
    const B = S.map(Si => Math.pow(sigma * Si, 2) / 2);

    // Finite difference solution
    for (let t = 0; t < t_max / dt; t++) {
      const newP = [...P];
      for (let i = 1; i < ns - 1; i++) {
        newP[i] = P[i] - dt * (
          (A[i] * (P[i + 1] - P[i - 1]) / (2 * dS)) -
          (B[i] * (P[i + 1] - 2 * P[i] + P[i - 1]) / Math.pow(dS, 2))
        );
      }
      P = newP;
    }

    // Normalize and find most likely price
    const finalSum = P.reduce((a, b) => a + b, 0) * dS;
    P = P.map(p => p / finalSum);
    
    const maxIdx = P.indexOf(Math.max(...P));
    const mostLikelyPrice = S[maxIdx];
    const mostLikelyProb = P[maxIdx] * 100;

    // Generate trading signal
    const priceChange = mostLikelyPrice - S0;
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (priceChange > 10 && mostLikelyProb > 5) signal = 'BUY';
    else if (priceChange < -10 && mostLikelyProb > 5) signal = 'SELL';

    // Generate predictions for display
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

  async getStatistics(interval = '1m'): Promise<{
    drift: string;
    volatility: string;
    timestamp: string;
    tradingSignal?: TradingSignal;
  }> {
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
    const tradingSignal = this.solveFokkerPlanck(
      mu,
      sigma,
      currentPrice,
      currentPrice * 0.8,
      currentPrice * 1.2
    );

    return {
      drift: mu.toFixed(6),
      volatility: sigma.toFixed(6),
      timestamp: new Date().toISOString(),
      tradingSignal
    };
  }
} 