import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service.js';
import { validateContactSubmission } from './contact.dto.js';
import { sendSuccess, sendError } from '../../middleware/response.js';

export class ContactController {
  constructor(private readonly service: ContactService) {}

  submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validation = validateContactSubmission(req.body);

      if (!validation.valid || !validation.data) {
        sendError(
          res,
          'VALIDATION_FAILED',
          'Request body failed validation',
          400,
          validation.issues
        );
        return;
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined;

      const result = await this.service.submitContact(validation.data, ipAddress);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };
}
