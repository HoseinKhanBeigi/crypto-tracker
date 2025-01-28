"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketModule = void 0;
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("./websocket.gateway");
const websocket_service_1 = require("./websocket.service");
const metrics_module_1 = require("../metrics/metrics.module");
const notifications_module_1 = require("../notifications/notifications.module");
const telegram_module_1 = require("../telegram/telegram.module");
let WebSocketModule = class WebSocketModule {
};
exports.WebSocketModule = WebSocketModule;
exports.WebSocketModule = WebSocketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            metrics_module_1.MetricsModule,
            notifications_module_1.NotificationsModule,
            (0, common_1.forwardRef)(() => telegram_module_1.TelegramModule)
        ],
        providers: [websocket_gateway_1.WebSocketGatewayService, websocket_service_1.WebSocketService],
        exports: [websocket_service_1.WebSocketService],
    })
], WebSocketModule);
//# sourceMappingURL=websocket.module.js.map