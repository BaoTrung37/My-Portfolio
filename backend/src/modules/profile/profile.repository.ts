import { Profile } from '@portfolio/shared';
import { query } from '../../db/client.js';

export interface IProfileRepository {
  getProfile(): Promise<Profile | null>;
}

export class PostgresProfileRepository implements IProfileRepository {
  async getProfile(): Promise<Profile | null> {
    const res = await query(`
      SELECT id, full_name, title, bio, avatar_url, location, social_links, available_for_hire, created_at, updated_at
      FROM profiles
      ORDER BY created_at ASC
      LIMIT 1
    `);

    if (!res.rows || res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      fullName: row.full_name,
      title: row.title,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      location: row.location,
      socialLinks: typeof row.social_links === 'string' ? JSON.parse(row.social_links) : row.social_links || {},
      availableForHire: Boolean(row.available_for_hire),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export class InMemoryProfileRepository implements IProfileRepository {
  private profile: Profile = {
    id: 'prof_default',
    fullName: 'Alex Rivera',
    title: 'Senior Fullstack Engineer & Cloud Architect',
    bio: 'Dedicated software engineer with 7+ years of experience crafting high-performance, resilient web platforms and developer-centric tooling. Passionate about TypeScript, modern UI/UX, and cloud-native systems.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    location: 'San Francisco, CA (Remote)',
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      email: 'alex.rivera.dev@example.com'
    },
    availableForHire: true
  };

  async getProfile(): Promise<Profile | null> {
    return { ...this.profile };
  }
}
