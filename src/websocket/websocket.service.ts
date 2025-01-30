import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;
  private readonly symbols = ['btcusdt'];
  private coinData: Record<string, number[]> = {};
  private timestamps: Record<string, number> = {};
  private latestMetrics: Record<string, any> = {};
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(
    private readonly metricsService: MetricsService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: WebSocketGatewayService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    this.connectToBinance();
  }

  private connectToBinance() {
    const streamNames = this.symbols
      .map((symbol) => `${symbol}@trade`)
      .join('/');

    const endpoints = [
      `wss://stream.binance.com:9443/stream?streams=${streamNames}`,
      `wss://stream.binance.com:9443/stream?streams=${streamNames}`,
      `wss://fstream.binance.com/stream?streams=${streamNames}`,
      `wss://dstream.binance.com/stream?streams=${streamNames}`,
    ];

    const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;

    const endpoint = endpoints[this.reconnectAttempts % endpoints.length];
    console.log(`🔌 Connecting to Binance WebSocket: ${endpoint}`);

    try {
      this.binanceWs = new WebSocket(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 30000,
      });

      this.binanceWs.on('open', () => {
        console.log('✅ Connected to Binance WebSocket');
      });

      this.binanceWs.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (!parsed.data) return;

          const stream = parsed.stream;
          const symbol = stream.split('@')[0];
          const trade = parsed.data;

          const price = parseFloat(trade.p);
          if (isNaN(price)) return;

          // Store raw price without modification
          const formattedPrice = this.metricsService.formatToInteger(price);
          const now = Date.now();

          if (!this.coinData[symbol]) {
            this.coinData[symbol] = [];
            this.timestamps[symbol] = now;
          }

          if (now - this.timestamps[symbol] >= 1000) {
            this.timestamps[symbol] = now;
            this.coinData[symbol].push(formattedPrice);

            if (this.coinData[symbol].length >= 60) {
              const metrics = this.metricsService.calculateMetrics(
                this.coinData[symbol],
              );

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
                await this.telegramService.sendMetricsUpdate(
                  symbol,
                  metrics,
                  193418752,
                );
              } catch (error) {
                console.error(`❌ Failed to send to Telegram:`, error);
              }

              this.coinData[symbol] = [];
              console.log(`🔄 Reset data collection for ${symbol}`);
            }
          }
        } catch (error) {
          console.error('❌ Error:', error);
        }
      });

      this.binanceWs.on('error', (err) => {
        console.error('❌ Binance WebSocket Error:', err.message);
        this.reconnectAttempts++;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(
            `🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
          );
          setTimeout(
            () => this.connectToBinance(),
            5000 * this.reconnectAttempts,
          );
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      });

      this.binanceWs.on('close', () => {
        console.log('🔄 Binance WebSocket closed.');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(
            `🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
          );
          setTimeout(
            () => this.connectToBinance(),
            5000 * this.reconnectAttempts,
          );
        }
      });
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(
          () => this.connectToBinance(),
          5000 * this.reconnectAttempts,
        );
      }
    }
  }

  onModuleDestroy() {
    if (this.binanceWs) {
      console.log('👋 Closing Binance WebSocket connection...');
      this.binanceWs.close();
    }
  }

  getLatestMetrics(symbol: string = 'btcusdt') {
    return this.latestMetrics[symbol];
  }

  isConnected(): boolean {
    return this.binanceWs?.readyState === WebSocket.OPEN;
  }
}
