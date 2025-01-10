import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  calculateMetrics(data: number[]) {
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

    console.log(
      `Metrics Calculated: Total Change = ${totalChange}, Avg Velocity = ${avgVelocity}`,
    );
    return { velocities, totalChange, avgVelocity };
  }
}
