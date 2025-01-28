import { TelegramService } from './telegram.service';
import { MetricsService } from '../metrics/metrics.service';
import { WebSocketService } from '../websocket/websocket.service';
export declare class TelegramController {
    private readonly telegramService;
    private readonly metricsService;
    private readonly webSocketService;
    private readonly logger;
    constructor(telegramService: TelegramService, metricsService: MetricsService, webSocketService: WebSocketService);
    handleWebhook(update: any, req: any): Promise<{
        ok: boolean;
        message: string;
        error?: undefined;
        timestamp?: undefined;
    } | {
        ok: boolean;
        error: any;
        timestamp: string;
        message?: undefined;
    }>;
}
