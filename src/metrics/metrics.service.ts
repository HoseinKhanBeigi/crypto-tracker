import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  calculateMetrics(data: number[], dt = 1) {
    let totalVelocity = 0;
    let totalAcceleration = 0;
    let totalJerk = 0;

    const velocities = [];
    const accelerations = [];
    const jerks = [];

    for (let i = 0; i < data.length - 1; i++) {
      // Velocity: First derivative
      const v = (data[i + 1] - data[i]) / dt;
      velocities.push(v);
      totalVelocity += v;

      if (i > 0) {
        // Acceleration: Second derivative
        const a = (velocities[i] - velocities[i - 1]) / dt;
        accelerations.push(a);
        totalAcceleration += a;

        if (i > 1) {
          // Jerk: Third derivative
          const j = (accelerations[i - 1] - accelerations[i - 2]) / dt;
          jerks.push(j);
          totalJerk += j;
        }
      }
    }

    // Averages
    const avgVelocity = totalVelocity / velocities.length || 0;
    const avgAcceleration = totalAcceleration / accelerations.length || 0;
    const avgJerk = totalJerk / jerks.length || 0;

    return {
      avgVelocity,
      avgAcceleration,
      avgJerk,
      totalVelocity,
      totalAcceleration,
      totalJerk,
    };
  }

  removeZeros = (input) => {
    const result = input.replace(/^0+|\.0+|(\.)(0+)/g, '').replace('.', '');
    return result;
  };

  formatToInteger(price: number) {
    if (price >= 1) {
      return price;
    } else if (price > 0.001) {
      return Math.round(price * 100_000);
    } else {
      return Math.round(price * 100_000_000);
    }
  }

  // Function to classify frequency levels
  classifyFrequency(numbers, thresholdPercentage = 50) {
    // Frequency analysis
    const frequency = numbers.reduce((acc, num) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
    }, {});

    // Calculate the maximum frequency
    const frequencies: any = Object.values(frequency);
    const maxFrequency = Math.max(...frequencies);
    const totalElements = numbers.length;

    // Calculate threshold based on the percentage
    const threshold = (thresholdPercentage / 100) * totalElements;

    // Determine the classification
    let status;
    if (maxFrequency > threshold) {
      status = 'High Frequency';
    } else if (maxFrequency === 1) {
      status = 'All Unique';
    } else {
      status = 'Low Frequency';
    }

    // Return detailed results

    return {
      status,
      maxFrequency,
      frequency,
      threshold,
      totalElements,
    };
  }
}
