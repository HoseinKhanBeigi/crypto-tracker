import { OnModuleInit } from '@nestjs/common';
export declare class TelegramService implements OnModuleInit {
    private readonly botToken;
    private readonly telegramApiUrl;
    onModuleInit(): Promise<void>;
    private setWebhook;
    sendMessage(chatId: string | number, text: string): Promise<void>;
    sendMetricsUpdate(symbol: string, metrics: any, chatId: string | number, price: any): Promise<void>;
    handleStartCommand(chatId: string | number): Promise<void>;
}
