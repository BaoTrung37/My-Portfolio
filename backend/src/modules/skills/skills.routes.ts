import { Router } from 'express';
import { SkillsController } from './skills.controller.js';
import { SkillsService } from './skills.service.js';
import { ISkillsRepository } from './skills.repository.js';

export function createSkillsRouter(repository: ISkillsRepository): Router {
  const router = Router();
  const service = new SkillsService(repository);
  const controller = new SkillsController(service);

  router.get('/', controller.getSkills);

  return router;
}
