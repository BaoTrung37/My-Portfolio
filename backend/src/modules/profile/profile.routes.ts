import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { IProfileRepository } from './profile.repository.js';

export function createProfileRouter(repository: IProfileRepository): Router {
  const router = Router();
  const service = new ProfileService(repository);
  const controller = new ProfileController(service);

  router.get('/', controller.getProfile);

  return router;
}
