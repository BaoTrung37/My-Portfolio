import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service.js';
import { sendSuccess } from '../../middleware/response.js';

export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.service.getProfile();
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };
}
