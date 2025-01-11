export declare class MetricsService {
    calculateMetrics(data: number[]): {
        velocities: any[];
        totalChange: number;
        avgVelocity: number;
    } | {
        totalChange: number;
        avgVelocity: number;
        velocities?: undefined;
    };
    formatToInteger(price: number): number;
    classifyFrequency(numbers: any, thresholdPercentage?: number): {
        status: any;
        maxFrequency: number;
        frequency: any;
        threshold: number;
        totalElements: any;
    };
}
