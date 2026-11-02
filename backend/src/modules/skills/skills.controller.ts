import { Request, Response, NextFunction } from 'express';
import { SkillsService } from './skills.service.js';
import { sendSuccess } from '../../middleware/response.js';

export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  getSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const featured = req.query.featured !== undefined ? req.query.featured === 'true' : undefined;

      const skills = await this.service.getSkills({ category, featured });
      sendSuccess(res, skills, 200, { total: skills.length });
    } catch (err) {
      next(err);
    }
  };
}
