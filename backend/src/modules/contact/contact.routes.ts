import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';
import { IContactRepository } from './contact.repository.js';

export function createContactRouter(repository: IContactRepository): Router {
  const router = Router();
  const service = new ContactService(repository);
  const controller = new ContactController(service);

  router.post('/', controller.submitContact);

  return router;
}
