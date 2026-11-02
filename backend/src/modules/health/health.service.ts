import { HealthStatus } from '@portfolio/shared';
import { checkDatabaseConnection } from '../../db/client.js';

export class HealthService {
  constructor(private readonly dbCheckFn: () => Promise<boolean> = checkDatabaseConnection) {}

  async getHealth(): Promise<HealthStatus> {
    const isDbConnected = await this.dbCheckFn();
    const uptimeSeconds = Math.round(process.uptime() * 10) / 10;

    return {
      status: isDbConnected ? 'UP' : 'DOWN',
      database: isDbConnected ? 'CONNECTED' : 'DISCONNECTED',
      uptimeSeconds,
      version: '1.0.0'
    };
  }
}
