import { fetchApi } from './api';
import {
  Profile,
  Skill,
  Project,
  ContactSubmissionDto,
  ContactSubmissionResult,
} from '@/types';

export const DEFAULT_PROFILE: Profile = {
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
    email: 'alex.rivera.dev@example.com',
  },
  availableForHire: true,
};

export const DEFAULT_SKILLS: Skill[] = [
  {
    id: 'sk_ts',
    name: 'TypeScript',
    category: 'languages',
    proficiency: 95,
    icon: 'typescript',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'sk_react',
    name: 'React / Next.js',
    category: 'frontend',
    proficiency: 92,
    icon: 'react',
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'sk_tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    proficiency: 90,
    icon: 'tailwind',
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'sk_node',
    name: 'Node.js / Express',
    category: 'backend',
    proficiency: 94,
    icon: 'nodejs',
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'sk_postgres',
    name: 'PostgreSQL',
    category: 'database',
    proficiency: 88,
    icon: 'postgresql',
    featured: true,
    displayOrder: 5,
  },
  {
    id: 'sk_docker',
    name: 'Docker & Compose',
    category: 'devops',
    proficiency: 85,
    icon: 'docker',
    featured: true,
    displayOrder: 6,
  },
  {
    id: 'sk_jest',
    name: 'Vitest & Supertest',
    category: 'tools',
    proficiency: 89,
    icon: 'test',
    featured: false,
    displayOrder: 7,
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj_1',
    title: 'CloudTelemetry Observability Suite',
    slug: 'cloud-telemetry-suite',
    description:
      'Real-time distributed tracing and metrics platform built for multi-cloud Kubernetes clusters with sub-second query latency.',
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    demoUrl: 'https://demo.example.com/telemetry',
    repoUrl: 'https://github.com/example/cloud-telemetry',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'proj_2',
    title: 'AI-Powered Code Reviewer',
    slug: 'ai-code-reviewer',
    description:
      'Automated GitHub pull request review bot utilizing LLM heuristics, AST diffing, and automated test coverage feedback.',
    technologies: ['TypeScript', 'Next.js', 'Express', 'Docker'],
    demoUrl: 'https://demo.example.com/reviewer',
    repoUrl: 'https://github.com/example/code-reviewer',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    featured: true,
    displayOrder: 2,
  },
  {
    id: 'proj_3',
    title: 'High-Throughput Task Engine',
    slug: 'task-engine',
    description:
      'Reliable background job orchestration engine supporting cron intervals, dead-letter queues, and real-time WebSocket progress tracking.',
    technologies: ['Node.js', 'PostgreSQL', 'Redis', 'TypeScript'],
    demoUrl: 'https://demo.example.com/engine',
    repoUrl: 'https://github.com/example/task-engine',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    featured: false,
    displayOrder: 3,
  },
];

export async function getProfile(): Promise<Profile> {
  try {
    const res = await fetchApi<Profile>('/profile');
    return res.data || DEFAULT_PROFILE;
  } catch (err) {
    return DEFAULT_PROFILE;
  }
}

export async function getSkills(category?: string): Promise<Skill[]> {
  try {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetchApi<Skill[]>(`/skills${query}`);
    return res.data || DEFAULT_SKILLS;
  } catch (err) {
    if (category) {
      return DEFAULT_SKILLS.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      );
    }
    return DEFAULT_SKILLS;
  }
}

export async function getProjects(featured?: boolean): Promise<Project[]> {
  try {
    const query = featured !== undefined ? `?featured=${featured}` : '';
    const res = await fetchApi<Project[]>(`/projects${query}`);
    return res.data || DEFAULT_PROJECTS;
  } catch (err) {
    if (featured !== undefined) {
      return DEFAULT_PROJECTS.filter((p) => p.featured === featured);
    }
    return DEFAULT_PROJECTS;
  }
}

export async function submitContact(
  dto: ContactSubmissionDto
): Promise<ContactSubmissionResult> {
  const res = await fetchApi<ContactSubmissionResult>('/contact', {
    method: 'POST',
    body: JSON.stringify(dto),
  });

  if (!res.data) {
    throw new Error('Invalid response from contact service');
  }

  return res.data;
}
