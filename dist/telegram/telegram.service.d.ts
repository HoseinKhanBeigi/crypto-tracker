import { OnModuleInit } from '@nestjs/common';
export declare class TelegramService implements OnModuleInit {
    private readonly botToken;
    private readonly telegramApiUrl;
    private readonly chatIds;
    onModuleInit(): Promise<void>;
    private setWebhook;
    sendMessage(chatId: string | number, text: string): Promise<void>;
    handleStartCommand(chatId: string | number): Promise<void>;
}
