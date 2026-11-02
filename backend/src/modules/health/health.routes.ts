import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

export function createHealthRouter(dbCheckFn?: () => Promise<boolean>): Router {
  const router = Router();
  const service = new HealthService(dbCheckFn);
  const controller = new HealthController(service);

  router.get('/', controller.getHealth);

  return router;
}
