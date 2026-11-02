import { Skill } from '@portfolio/shared';
import { query } from '../../db/client.js';

export interface SkillsFilter {
  category?: string;
  featured?: boolean;
}

export interface ISkillsRepository {
  getSkills(filters?: SkillsFilter): Promise<Skill[]>;
}

export class PostgresSkillsRepository implements ISkillsRepository {
  async getSkills(filters?: SkillsFilter): Promise<Skill[]> {
    let sql = `
      SELECT id, name, category, proficiency, icon, featured, display_order, created_at
      FROM skills
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.category) {
      params.push(filters.category.toLowerCase());
      sql += ` AND LOWER(category) = $${params.length}`;
    }

    if (filters?.featured !== undefined) {
      params.push(filters.featured);
      sql += ` AND featured = $${params.length}`;
    }

    sql += ' ORDER BY display_order ASC, name ASC';

    const res = await query(sql, params);
    return res.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      proficiency: Number(row.proficiency),
      icon: row.icon,
      featured: Boolean(row.featured),
      displayOrder: Number(row.display_order),
      createdAt: row.created_at
    }));
  }
}

export class InMemorySkillsRepository implements ISkillsRepository {
  private skills: Skill[] = [
    { id: 'sk_ts', name: 'TypeScript', category: 'languages', proficiency: 95, icon: 'typescript', featured: true, displayOrder: 1 },
    { id: 'sk_react', name: 'React / Next.js', category: 'frontend', proficiency: 92, icon: 'react', featured: true, displayOrder: 2 },
    { id: 'sk_tailwind', name: 'Tailwind CSS', category: 'frontend', proficiency: 90, icon: 'tailwind', featured: true, displayOrder: 3 },
    { id: 'sk_node', name: 'Node.js / Express', category: 'backend', proficiency: 94, icon: 'nodejs', featured: true, displayOrder: 4 },
    { id: 'sk_postgres', name: 'PostgreSQL', category: 'database', proficiency: 88, icon: 'postgresql', featured: true, displayOrder: 5 },
    { id: 'sk_docker', name: 'Docker & Compose', category: 'devops', proficiency: 85, icon: 'docker', featured: true, displayOrder: 6 },
    { id: 'sk_jest', name: 'Vitest & Supertest', category: 'tools', proficiency: 89, icon: 'test', featured: false, displayOrder: 7 }
  ];

  async getSkills(filters?: SkillsFilter): Promise<Skill[]> {
    let list = [...this.skills];
    if (filters?.category) {
      const cat = filters.category.toLowerCase();
      list = list.filter((s) => s.category.toLowerCase() === cat);
    }
    if (filters?.featured !== undefined) {
      list = list.filter((s) => s.featured === filters.featured);
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }
}
