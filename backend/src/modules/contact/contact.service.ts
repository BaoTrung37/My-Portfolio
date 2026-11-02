import { ContactSubmissionDto, ContactSubmissionResult } from '@portfolio/shared';
import { IContactRepository } from './contact.repository.js';

export class ContactService {
  constructor(private readonly repository: IContactRepository) {}

  async submitContact(dto: ContactSubmissionDto, ipAddress?: string): Promise<ContactSubmissionResult> {
    const saved = await this.repository.saveMessage({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      ipAddress
    });

    return {
      id: saved.id,
      message: 'Thank you for reaching out! Your message has been received.',
      submittedAt: saved.createdAt
    };
  }

  async getMessages() {
    return this.repository.getMessages();
  }
}
