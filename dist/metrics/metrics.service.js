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
        return { totalChange, avgVelocity };
    }
    formatToInteger(price) {
        if (price >= 1) {
            return price;
        }
        else if (price > 0.0001) {
            return Math.round(price * 1_000_0);
        }
        else {
            return Math.round(price * 100_000_000);
        }
    }
    classifyFrequency(numbers, thresholdPercentage = 50) {
        const frequency = numbers.reduce((acc, num) => {
            acc[num] = (acc[num] || 0) + 1;
            return acc;
        }, {});
        const frequencies = Object.values(frequency);
        const maxFrequency = Math.max(...frequencies);
        const totalElements = numbers.length;
        const threshold = (thresholdPercentage / 100) * totalElements;
        let status;
        if (maxFrequency > threshold) {
            status = 'High Frequency';
        }
        else if (maxFrequency === 1) {
            status = 'All Unique';
        }
        else {
            status = 'Low Frequency';
        }
        return {
            status,
            maxFrequency,
            frequency,
            threshold,
            totalElements,
        };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map