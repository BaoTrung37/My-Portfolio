import { Request, Response, NextFunction } from 'express';
import { HealthService } from './health.service.js';
import { sendSuccess, sendError } from '../../middleware/response.js';

export class HealthController {
  constructor(private readonly service: HealthService) {}

  getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.service.getHealth();
      if (health.database === 'CONNECTED') {
        sendSuccess(res, health, 200);
      } else {
        // Return 503 Service Unavailable if database is disconnected
        sendError(res, 'DATABASE_DISCONNECTED', 'Database connection unavailable', 503, [
          { field: 'database', issue: 'PostgreSQL connection failed' }
        ]);
      }
    } catch (err) {
      next(err);
    }
  };
}
