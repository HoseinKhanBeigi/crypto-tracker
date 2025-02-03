export declare class MetricsService {
    calculateMetrics(data: number[], dt?: number): {
        data: number[];
        avgVelocity: number;
        avgAcceleration: number;
        avgJerk: number;
        totalVelocity: number;
        totalAcceleration: number;
        totalJerk: number;
    };
    removeZeros: (input: any) => any;
    formatToInteger(price: number): number;
    classifyFrequency(numbers: any, thresholdPercentage?: number): {
        status: any;
        maxFrequency: number;
        frequency: any;
        threshold: number;
        totalElements: any;
    };
}
