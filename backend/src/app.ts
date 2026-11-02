import express, { Express, Request, Response } from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendError } from './middleware/response.js';
import { config } from './config/env.js';
import { checkDatabaseConnection } from './db/client.js';

import {
  IProfileRepository,
  PostgresProfileRepository,
  InMemoryProfileRepository
} from './modules/profile/profile.repository.js';
import { createProfileRouter } from './modules/profile/profile.routes.js';

import {
  ISkillsRepository,
  PostgresSkillsRepository,
  InMemorySkillsRepository
} from './modules/skills/skills.repository.js';
import { createSkillsRouter } from './modules/skills/skills.routes.js';

import {
  IProjectRepository,
  PostgresProjectRepository,
  InMemoryProjectRepository
} from './modules/projects/projects.repository.js';
import { createProjectsRouter } from './modules/projects/projects.routes.js';

import {
  IContactRepository,
  PostgresContactRepository,
  InMemoryContactRepository
} from './modules/contact/contact.repository.js';
import { createContactRouter } from './modules/contact/contact.routes.js';

import { createHealthRouter } from './modules/health/health.routes.js';

export interface AppRepositories {
  profile?: IProfileRepository;
  skills?: ISkillsRepository;
  projects?: IProjectRepository;
  contact?: IContactRepository;
  dbCheckFn?: () => Promise<boolean>;
  useInMemory?: boolean;
}

export function createApp(customRepos: AppRepositories = {}): Express {
  const app = express();

  // Determine repository mode
  // Use in-memory if explicitly specified, or if in test environment or if DATABASE_URL is empty
  const useInMemory = customRepos.useInMemory !== undefined
    ? customRepos.useInMemory
    : (config.isTest || !config.databaseUrl);

  const profileRepo = customRepos.profile || (useInMemory ? new InMemoryProfileRepository() : new PostgresProfileRepository());
  const skillsRepo = customRepos.skills || (useInMemory ? new InMemorySkillsRepository() : new PostgresSkillsRepository());
  const projectsRepo = customRepos.projects || (useInMemory ? new InMemoryProjectRepository() : new PostgresProjectRepository());
  const contactRepo = customRepos.contact || (useInMemory ? new InMemoryContactRepository() : new PostgresContactRepository());
  const dbCheckFn = customRepos.dbCheckFn || (useInMemory ? async () => true : checkDatabaseConnection);

  // Global Middlewares
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(corsMiddleware);
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  // API Routes
  app.use('/api/health', createHealthRouter(dbCheckFn));
  app.use('/api/profile', createProfileRouter(profileRepo));
  app.use('/api/skills', createSkillsRouter(skillsRepo));
  app.use('/api/projects', createProjectsRouter(projectsRepo));
  app.use('/api/contact', createContactRouter(contactRepo));

  // 404 Handler for undefined routes
  app.use((req: Request, res: Response) => {
    sendError(res, 'NOT_FOUND', `Cannot ${req.method} ${req.path}`, 404);
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
