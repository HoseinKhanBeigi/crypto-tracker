export declare class MetricsService {
    calculateMetrics(data: number[]): {
        velocities: any[];
        totalChange: number;
        avgVelocity: number;
    };
    formatToInteger(price: number): number;
}
