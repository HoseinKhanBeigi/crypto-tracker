import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';

// Helper function to format prices to integers
function formatToInteger(price) {
  if (price >= 1) {
    return price;
  } else if (price > 0.0001) {
    return Math.round(price * 1_000_0);
  } else {
    return Math.round(price * 100_000_000);
  }
}

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket | null = null;
  private readonly symbols = ['btcusdt', 'ethusdt', 'adausdt'];
  private coinData: Record<string, number[]> = {};
  private timestamps: Record<string, number> = {};
  private reconnectDelay = 5000; // Delay before attempting to reconnect

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
    console.log(`Attempting to connect to Binance WebSocket: ${url}`);

    this.binanceWs = new WebSocket(url);

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
      console.warn(
        `Binance WebSocket closed. Code: ${code}, Reason: ${reason}`,
      );
      this.scheduleReconnect();
    });
  }

  private disconnectFromBinance() {
    if (this.binanceWs) {
      this.binanceWs.close();
      console.log('Disconnected from Binance WebSocket.');
    }
  }

  private scheduleReconnect() {
    console.log(
      `Reconnecting to Binance WebSocket in ${this.reconnectDelay / 1000} seconds...`,
    );
    setTimeout(() => {
      this.connectToBinance();
    }, this.reconnectDelay);
  }

  private handleMessage(message: string) {
    const parsed = JSON.parse(message);
    const stream = parsed.stream;
    const symbol = stream.split('@')[0];
    const trade = parsed.data;

    const price = parseFloat(trade.p);
    if (isNaN(price)) return;

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
        const metrics = this.metricsService.calculateMetrics(
          this.coinData[symbol],
        );
        console.log(`Metrics for ${symbol.toUpperCase()}:`, metrics);

        if (Math.abs(metrics.avgVelocity) > 8) {
          this.notificationsService.sendLocalNotification(
            symbol,
            metrics.avgVelocity,
          );
        }

        this.gateway.broadcast('price', { symbol, formattedPrice });
        this.coinData[symbol] = [];
      }
    }
  }
}
