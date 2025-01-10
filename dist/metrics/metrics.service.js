"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    calculateMetrics(data) {
        if (data.length < 2) {
            return { velocities: [], totalChange: 0, avgVelocity: 0 };
        }
        const velocities = [];
        let totalChange = 0;
        for (let i = 0; i < data.length - 1; i++) {
            const change = data[i + 1] - data[i];
            velocities.push(change);
            totalChange += change;
        }
        const totalTime = data.length - 1;
        const avgVelocity = totalTime > 0 ? totalChange / totalTime : 0;
        console.log(`Metrics Calculated: Total Change = ${totalChange}, Avg Velocity = ${avgVelocity}`);
        return { velocities, totalChange, avgVelocity };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map