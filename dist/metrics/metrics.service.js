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
    constructor() {
        this.removeZeros = (input) => {
            const result = input.replace(/^0+|\.0+|(\.)(0+)/g, '').replace('.', '');
            return result;
        };
    }
    calculateMetrics(data, dt = 1) {
        let totalVelocity = 0;
        let totalAcceleration = 0;
        let totalJerk = 0;
        const velocities = [];
        const accelerations = [];
        const jerks = [];
        for (let i = 0; i < data.length - 1; i++) {
            const v = (data[i + 1] - data[i]) / dt;
            velocities.push(v);
            totalVelocity += v;
            if (i > 0) {
                const a = (velocities[i] - velocities[i - 1]) / dt;
                accelerations.push(a);
                totalAcceleration += a;
                if (i > 1) {
                    const j = (accelerations[i - 1] - accelerations[i - 2]) / dt;
                    jerks.push(j);
                    totalJerk += j;
                }
            }
        }
        const avgVelocity = totalVelocity / velocities.length || 0;
        const avgAcceleration = totalAcceleration / accelerations.length || 0;
        const avgJerk = totalJerk / jerks.length || 0;
        return {
            data,
            avgVelocity,
            avgAcceleration,
            avgJerk,
            totalVelocity,
            totalAcceleration,
            totalJerk,
        };
    }
    formatToInteger(price) {
        if (price >= 1) {
            return price;
        }
        else if (price > 0.001) {
            return Math.round(price * 100_000);
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