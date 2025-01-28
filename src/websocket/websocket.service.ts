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
      `wss://stream.binance.us:9443/stream?streams=${streamNames}`,
      `wss://stream.binance.com:9443/stream?streams=${streamNames}`,
      `wss://fstream.binance.com/stream?streams=${streamNames}`,
      `wss://dstream.binance.com/stream?streams=${streamNames}`
    ];

    const endpoint = endpoints[this.reconnectAttempts % endpoints.length];
    console.log(`🔌 Connecting to Binance WebSocket: ${endpoint}`);

    try {
      this.binanceWs = new WebSocket(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000,
      });

      this.binanceWs.on('open', () => {
        console.log('✅ Connected to Binance WebSocket');
        this.reconnectAttempts = 0;
        
        const subscribeMsg = {
          method: 'SUBSCRIBE',
          params: this.symbols.map(symbol => `${symbol}@trade`),
          id: 1
        };
        this.binanceWs.send(JSON.stringify(subscribeMsg));
        console.log('📨 Sent subscription message:', subscribeMsg);
      });

      this.binanceWs.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          console.log('📥 Received message:', parsed);

          if (!parsed.data) {
            console.log('⏭️ Skipping non-trade message');
            return;
          }

          const stream = parsed.stream;
          const symbol = stream.split('@')[0];
          const trade = parsed.data;

          const price = parseFloat(trade.p);
          if (isNaN(price)) {
            console.log('⚠️ Invalid price:', trade.p);
            return;
          }

          const formattedPrice = this.metricsService.formatToInteger(price);
          console.log(`💰 ${symbol}: Price = ${formattedPrice}`);

          const now = Date.now();

          if (!this.coinData[symbol]) {
            console.log(`📊 Initializing data collection for ${symbol}`);
            this.coinData[symbol] = [];
            this.timestamps[symbol] = now;
          }

          if (now - this.timestamps[symbol] >= 1000) {
            this.timestamps[symbol] = now;
            this.coinData[symbol].push(formattedPrice);
            console.log(`📊 ${symbol}: Data points collected: ${this.coinData[symbol].length}/10`);

            if (this.coinData[symbol].length >= 10) {
              console.log(`🧮 Starting metrics calculation for ${symbol}...`);
              console.log(`Data points:`, this.coinData[symbol]);
              
              const metrics = this.metricsService.calculateMetrics(
                this.coinData[symbol],
              );
              
              console.log(`📈 Metrics calculated for ${symbol}:`, metrics);
              this.latestMetrics[symbol] = metrics;

              try {
                console.log(`📤 Attempting to send metrics to Telegram...`);
                console.log(`Using chat ID: 193418752`);
                await this.telegramService.sendMetricsUpdate(symbol, metrics, 193418752);
                console.log(`✅ Metrics sent to Telegram successfully`);
              } catch (error) {
                console.error(`❌ Failed to send metrics to Telegram:`, error);
                console.error(`Error details:`, error.response?.data || error.message);
              }

              this.gateway.broadcast('price', { symbol, formattedPrice });
              this.coinData[symbol] = [];
              console.log(`🔄 Reset data collection for ${symbol}`);
            }
          }
        } catch (error) {
          console.error('❌ Error processing message:', error);
          console.error('Error stack:', error.stack);
        }
      });

      this.binanceWs.on('error', (err) => {
        console.error('❌ Binance WebSocket Error:', err.message);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          setTimeout(() => this.connectToBinance(), 5000 * this.reconnectAttempts);
        } else {
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

    } catch (error) {
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

  getLatestMetrics(symbol: string = 'btcusdt') {
    return this.latestMetrics[symbol];
  }
}
