import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PingService implements OnModuleInit {
  private readonly appUrl = 'https://crypto-tracker-git-main-hoseinkhanbeigis-projects.vercel.app';

  async onModuleInit() {
    // Start pinging the app every 5 minutes
    // setInterval(async () => {
    //   try {
    //     await axios.get(`${this.appUrl}/ping`);
    //    
    //   } catch (error) {
    //     console.error('❌ Ping failed:', error.message);
    //   }
    // }, 5 * 60 * 1000); // 5 minutes
  }
} 