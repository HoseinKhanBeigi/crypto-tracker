import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;
  private readonly symbols = ['btcusdt', 'ethusdt', 'adausdt'];
  private coinData: Record<string, number[]> = {};
  private timestamps: Record<string, number> = {};

  constructor(
    private readonly metricsService: MetricsService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: WebSocketGatewayService,
  ) {}

  onModuleInit() {
    this.connectToBinance();
  }

  onModuleDestroy() {
    this.disconnectFromBinance();
  }

  private connectToBinance() {
    const streamNames = this.symbols
      .map((symbol) => `${symbol}@trade`)
      .join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;
    console.log(`Connecting to Binance WebSocket: ${url}`);

    this.binanceWs = new WebSocket(url);

    this.binanceWs.on('open', () => {
      console.log('Connected to Binance WebSocket.');
    });

    this.binanceWs.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
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

        if (this.coinData[symbol].length >= 30) {
          const metrics = this.metricsService.calculateMetrics(
            this.coinData[symbol],
          );
          console.log(`Metrics for ${symbol.toUpperCase()}:`, metrics);

          if (Math.abs(metrics.avgVelocity) > 4) {
            this.notificationsService.sendLocalNotification(
              symbol,
              Math.abs(metrics.avgVelocity),
            );
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

  private disconnectFromBinance() {
    if (this.binanceWs) {
      this.binanceWs.close();
      console.log('Disconnected from Binance WebSocket.');
    }
  }
}
