import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;

  private readonly symbols = ['btcusdt', 'dogeusdt', 'xrpusdt'];
  private coinData: Record<string, number[]> = {};
  private timestamps: Record<string, number> = {};
  private latestMetrics: Record<string, any> = {};

  constructor(
    private readonly metricsService: MetricsService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: WebSocketGatewayService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    // console.log('🚀 WebSocket Service initializing...');
    this.connectToBinance();
  }

  private connectToBinance() {
    const streamNames = this.symbols
      .map((symbol) => `${symbol}@trade`)
      .join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;
    console.log(`🔌 Connecting to Binance WebSocket: ${url}`);

    this.binanceWs = new WebSocket(url);

    this.binanceWs.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
    });

    this.binanceWs.on('message', async (data) => {
      const parsed = JSON.parse(data.toString());
      const stream = parsed.stream;
      const symbol = stream.split('@')[0];
      const trade = parsed.data;

      const price = parseFloat(trade.p);
      if (isNaN(price)) return;

      const formattedPrice = this.metricsService.formatToInteger(price);
      const now = Date.now();

      if (!this.coinData[symbol]) {
        // console.log(`📊 Initializing data collection for ${symbol}`);
        this.coinData[symbol] = [];
        this.timestamps[symbol] = now;
      }

      if (now - this.timestamps[symbol] >= 1000) {
        this.timestamps[symbol] = now;
        this.coinData[symbol].push(formattedPrice);
        // console.log(`📈 ${symbol}: Collected ${this.coinData[symbol].length}/50 data points`);

        if (this.coinData[symbol].length >= 5) {
          console.log(`🧮 Calculating metrics for ${symbol}...`);
          const metrics = this.metricsService.calculateMetrics(
            this.coinData[symbol],
          );
          
          // Store the latest metrics
          this.latestMetrics[symbol] = metrics;

          // console.log(`✅ Metrics calculated for ${symbol}:`, metrics);

          try {
            console.log(`📤 Sending metrics to Telegram for ${symbol}...`);
            await this.telegramService.sendMetricsUpdate(symbol, metrics);
            console.log(`✅ Metrics sent to Telegram successfully`);
          } catch (error) {
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

  getLatestMetrics(symbol: string = 'btcusdt') {
    return this.latestMetrics[symbol] || {
      avgVelocity: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      range: 0
    };
  }
}
