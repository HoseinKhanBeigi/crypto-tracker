"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingController = void 0;
const common_1 = require("@nestjs/common");
let PingController = PingController_1 = class PingController {
    constructor() {
        this.logger = new common_1.Logger(PingController_1.name);
    }
    ping() {
        try {
            this.logger.log('Received ping request');
            return 'pong';
        }
        catch (error) {
            this.logger.error('Error handling ping:', error);
            throw error;
        }
    }
};
exports.PingController = PingController;
__decorate([
    (0, common_1.Get)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PingController.prototype, "ping", null);
exports.PingController = PingController = PingController_1 = __decorate([
    (0, common_1.Controller)()
], PingController);
//# sourceMappingURL=ping.controller.js.map