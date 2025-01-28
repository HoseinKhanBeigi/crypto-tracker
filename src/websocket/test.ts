import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;
  private readonly symbols = [
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

        if (this.coinData[symbol].length >= 5) {
          const metrics = this.metricsService.calculateMetrics(
            this.coinData[symbol],
          );

          const freq = this.metricsService.classifyFrequency(
            this.coinData[symbol],
          );

          // Log metrics and frequency to the console
          console.log(`Metrics for ${symbol.toUpperCase()}:`, metrics);
          // console.log(`Frequency for ${symbol.toUpperCase()}:`, freq);

          // Save metrics and frequency to a file
          // this.saveMetricsToFile(symbol, metrics, freq);

          if (Math.abs(metrics.avgVelocity) > 4.5) {
            this.notificationsService.sendLocalNotification(
              symbol,
              metrics.avgVelocity,
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

  private saveMetricsToFile(symbol: string, metrics: any, freq: any) {
    const logFilePath = path.join(
      __dirname,
      '..',
      '..',
      'logs',
      `${symbol}-metrics.json`,
    );
    const logData = {
      timestamp: new Date().toISOString(),
      metrics,
      freq,
    };

    try {
      // Ensure the logs directory exists
      fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

      // Append metrics and frequency to the log file
      fs.appendFileSync(logFilePath, JSON.stringify(logData) + '\n', 'utf-8');
      console.log(`Metrics and frequency saved to ${logFilePath}`);
    } catch (error) {
      console.error('Error saving metrics to file:', error.message);
    }
  }
}
