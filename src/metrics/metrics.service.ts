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
    return { totalChange, avgVelocity };
  }

  // Helper function to format prices to integers
  formatToInteger(price: number) {
    if (price >= 1) {
      return price;
    } else if (price > 0.0001) {
      return Math.round(price * 1_000_0);
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
