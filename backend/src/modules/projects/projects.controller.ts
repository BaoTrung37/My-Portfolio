import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from './projects.service.js';
import { sendSuccess } from '../../middleware/response.js';

export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined;

      const projects = await this.service.getProjects({ featured });
      sendSuccess(res, projects, 200, { total: projects.length });
    } catch (err) {
      next(err);
    }
  };
}
