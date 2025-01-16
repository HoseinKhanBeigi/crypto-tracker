import { Injectable } from '@nestjs/common';
import notifier from 'node-notifier';

@Injectable()
export class NotificationsService {
  sendLocalNotification(symbol: string, avgVelocity: number) {
    const message = `🚨 High Velocity Alert 🚨\nSymbol: ${symbol.toUpperCase()}\nAvg Velocity: ${avgVelocity.toFixed(2)}`;
    notifier.notify({
      title: 'Crypto Tracker Alert',
      message,
      sound: false, // Play a sound
      wait: false, // Does not wait for user interaction
    });
    console.log(`Desktop notification sent: ${message}`);
  }
}
