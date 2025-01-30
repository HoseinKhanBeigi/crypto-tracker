import { WebSocketService } from '../websocket/websocket.service';
export declare class HealthController {
    private webSocketService;
    constructor(webSocketService: WebSocketService);
    check(): Promise<{
        status: string;
        websocket: boolean;
        timestamp: string;
    }>;
}
