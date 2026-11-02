import { Project } from '@portfolio/shared';
import { query } from '../../db/client.js';

export interface ProjectsFilter {
  featured?: boolean;
}

export interface IProjectRepository {
  getProjects(filters?: ProjectsFilter): Promise<Project[]>;
}

export class PostgresProjectRepository implements IProjectRepository {
  async getProjects(filters?: ProjectsFilter): Promise<Project[]> {
    let sql = `
      SELECT id, title, slug, description, technologies, demo_url, repo_url, image_url, featured, display_order, created_at
      FROM projects
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.featured !== undefined) {
      params.push(filters.featured);
      sql += ` AND featured = $${params.length}`;
    }

    sql += ' ORDER BY display_order ASC, created_at DESC';

    const res = await query(sql, params);
    return res.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      technologies: typeof row.technologies === 'string' ? JSON.parse(row.technologies) : row.technologies || [],
      demoUrl: row.demo_url,
      repoUrl: row.repo_url,
      imageUrl: row.image_url,
      featured: Boolean(row.featured),
      displayOrder: Number(row.display_order),
      createdAt: row.created_at
    }));
  }
}

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Project[] = [
    {
      id: 'proj_1',
      title: 'CloudTelemetry Observability Suite',
      slug: 'cloud-telemetry-suite',
      description: 'Real-time distributed tracing and metrics platform built for multi-cloud Kubernetes clusters with sub-second query latency.',
      technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      demoUrl: 'https://demo.example.com/telemetry',
      repoUrl: 'https://github.com/example/cloud-telemetry',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 1
    },
    {
      id: 'proj_2',
      title: 'AI-Powered Code Reviewer',
      slug: 'ai-code-reviewer',
      description: 'Automated GitHub pull request review bot utilizing LLM heuristics, AST diffing, and automated test coverage feedback.',
      technologies: ['TypeScript', 'Next.js', 'Express', 'Docker'],
      demoUrl: 'https://demo.example.com/reviewer',
      repoUrl: 'https://github.com/example/code-reviewer',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      featured: true,
      displayOrder: 2
    },
    {
      id: 'proj_3',
      title: 'High-Throughput Task Engine',
      slug: 'task-engine',
      description: 'Reliable background job orchestration engine supporting cron intervals, dead-letter queues, and real-time WebSocket progress tracking.',
      technologies: ['Node.js', 'PostgreSQL', 'Redis', 'TypeScript'],
      demoUrl: 'https://demo.example.com/engine',
      repoUrl: 'https://github.com/example/task-engine',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      featured: false,
      displayOrder: 3
    }
  ];

  async getProjects(filters?: ProjectsFilter): Promise<Project[]> {
    let list = [...this.projects];
    if (filters?.featured !== undefined) {
      list = list.filter((p) => p.featured === filters.featured);
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }
}
