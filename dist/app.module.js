"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const websocket_module_1 = require("./websocket/websocket.module");
const metrics_module_1 = require("./metrics/metrics.module");
const notifications_module_1 = require("./notifications/notifications.module");
const telegram_module_1 = require("./telegram/telegram.module");
const ping_service_1 = require("./ping.service");
const ping_controller_1 = require("./ping/ping.controller");
const binance_module_1 = require("./binance/binance.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            binance_module_1.BinanceModule,
            websocket_module_1.WebSocketModule,
            metrics_module_1.MetricsModule,
            notifications_module_1.NotificationsModule,
            telegram_module_1.TelegramModule,
        ],
        controllers: [ping_controller_1.PingController],
        providers: [ping_service_1.PingService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map