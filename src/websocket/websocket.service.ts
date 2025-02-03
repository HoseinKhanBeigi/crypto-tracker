import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';
import { TelegramService } from '../telegram/telegram.service';
import { BinanceService } from '../binance/binance.service';

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;
  private readonly symbols = ['btcusdt'];
  private coinData: Record<string, number[]> = {};
  private timestamps: Record<string, number> = {};
  private latestMetrics: Record<string, any> = {};
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  // private readonly chatIds = [193418752, 247671667];

  private readonly chatIds = [193418752, 247671667, 248797966, 104883495, 108920302, 5535999915];


  constructor(
    private readonly metricsService: MetricsService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: WebSocketGatewayService,
    private readonly telegramService: TelegramService,
    private readonly binanceService: BinanceService,
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

    try {
      this.binanceWs = new WebSocket(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 30000,
      });

      this.binanceWs.on('open', () => {});

      this.binanceWs.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (!parsed.data) return;

          const stream = parsed.stream;
          const symbol = stream.split('@')[0];
          const trade = parsed.data;

          const price = parseFloat(trade.p);
          if (isNaN(price)) return;

          const formattedPrice = this.metricsService.formatToInteger(price);
          const now = Date.now();

          if (!this.coinData[symbol]) {
            this.coinData[symbol] = [];
            this.timestamps[symbol] = now;
          }

          if (now - this.timestamps[symbol] >= 1000) {
            this.timestamps[symbol] = now;
            this.coinData[symbol].push(formattedPrice);

            if (this.coinData[symbol].length >= 50) {
              const metrics = this.metricsService.calculateMetrics(
                this.coinData[symbol],
              );

            

              // Only send message if velocity is significant
              if (Math.abs(metrics.avgVelocity) > 3) {
                try {
                  // await this.handlePriceUpdate(symbol, price);
                  await this.sendMetricsUpdate(
                    symbol,
                    metrics,
                    null,
                    price,
                  );
                } catch (error) {
                  console.error(`❌ Failed to send to Telegram:`, error);
                }
              }

              this.coinData[symbol] = [];
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
          setTimeout(
            () => this.connectToBinance(),
            5000 * this.reconnectAttempts,
          );
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      });

      this.binanceWs.on('close', () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
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
      this.binanceWs.close();
    }
  }

  getLatestMetrics(symbol: string = 'btcusdt') {
    return this.latestMetrics[symbol];
  }

  isConnected(): boolean {
    return this.binanceWs?.readyState === WebSocket.OPEN;
  }

  private async handlePriceUpdate(symbol: string, price: number) {
    const stats = await this.binanceService.getStatistics();

    if (stats.tradingSignal) {
      const message = `
📊 ${symbol.toUpperCase()} Analysis:
💰 Current Price: $${price}
📈 Drift: ${stats.drift}
📊 Volatility: ${stats.volatility}
🎯 Predicted Price: $${stats.tradingSignal.mostLikelyPrice.toFixed(2)}
📈 Probability: ${stats.tradingSignal.probability.toFixed(2)}%
📢 Signal: ${stats.tradingSignal.signal}
`;

  
      
      // Use Promise.all to send messages in parallel
      await Promise.all(
        this.chatIds.map(chatId => this.telegramService.sendMessage(chatId, message))
      );
    }
  }

  async sendMetricsUpdate(
    symbol: string,
    metrics: any,
    _chatId: string | number,
    price: any,
  ): Promise<void> {
    const message = `
📊 ${symbol.toUpperCase()} Update:
Current Price: $${price}
data:$${metrics.data}
📈 Avg Velocity: $${metrics.avgVelocity}
`;

    // Send to all chat IDs in parallel
    await Promise.all(
      this.chatIds.map(async (chatId) => {
        try {
          await this.telegramService.sendMessage(chatId, message);
        } catch (error) {
          console.error(`❌ Failed to send to chat ${chatId}:`, error.message);
        }
      })
    );
  }
}
