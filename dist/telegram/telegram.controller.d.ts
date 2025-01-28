import { TelegramService } from './telegram.service';
export declare class TelegramController {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
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
