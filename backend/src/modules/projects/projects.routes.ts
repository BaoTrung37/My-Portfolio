import { Router } from 'express';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { IProjectRepository } from './projects.repository.js';

export function createProjectsRouter(repository: IProjectRepository): Router {
  const router = Router();
  const service = new ProjectsService(repository);
  const controller = new ProjectsController(service);

  router.get('/', controller.getProjects);

  return router;
}
