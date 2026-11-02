import crypto from 'crypto';
import { ContactMessage } from '@portfolio/shared';
import { query } from '../../db/client.js';

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  ipAddress?: string;
}

export interface IContactRepository {
  saveMessage(input: CreateContactMessageInput): Promise<ContactMessage>;
  getMessages(): Promise<ContactMessage[]>;
}

export class PostgresContactRepository implements IContactRepository {
  async saveMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
    const id = `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const status = 'unread';
    const createdAt = new Date().toISOString();

    const sql = `
      INSERT INTO contact_messages (id, name, email, subject, message, status, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, subject, message, status, ip_address, created_at
    `;

    const values = [
      id,
      input.name,
      input.email,
      input.subject || null,
      input.message,
      status,
      input.ipAddress || null,
      createdAt
    ];

    const res = await query(sql, values);
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject || undefined,
      message: row.message,
      status: row.status,
      ipAddress: row.ip_address || undefined,
      createdAt: row.created_at
    };
  }

  async getMessages(): Promise<ContactMessage[]> {
    const res = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return res.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject || undefined,
      message: row.message,
      status: row.status,
      ipAddress: row.ip_address || undefined,
      createdAt: row.created_at
    }));
  }
}

export class InMemoryContactRepository implements IContactRepository {
  private messages: ContactMessage[] = [];

  async saveMessage(input: CreateContactMessageInput): Promise<ContactMessage> {
    const msg: ContactMessage = {
      id: `msg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      status: 'unread',
      ipAddress: input.ipAddress,
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);
    return { ...msg };
  }

  async getMessages(): Promise<ContactMessage[]> {
    return [...this.messages];
  }
}
