import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebSocketGatewayService } from './websocket.gateway';
import { TelegramService } from '../telegram/telegram.service';
export declare class WebSocketService implements OnModuleInit, OnModuleDestroy {
    private readonly metricsService;
    private readonly notificationsService;
    private readonly gateway;
    private readonly telegramService;
    private binanceWs;
    private readonly symbols;
    private coinData;
    private timestamps;
    private latestMetrics;
    private reconnectAttempts;
    private readonly maxReconnectAttempts;
    constructor(metricsService: MetricsService, notificationsService: NotificationsService, gateway: WebSocketGatewayService, telegramService: TelegramService);
    onModuleInit(): void;
    private connectToBinance;
    onModuleDestroy(): void;
    getLatestMetrics(symbol?: string): any;
}
