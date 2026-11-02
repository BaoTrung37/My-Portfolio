-- Seed Profile
INSERT INTO profiles (id, full_name, title, bio, avatar_url, location, social_links, available_for_hire)
VALUES (
  'prof_default',
  'Alex Rivera',
  'Senior Fullstack Engineer & Cloud Architect',
  'Dedicated software engineer with 7+ years of experience crafting high-performance, resilient web platforms and developer-centric tooling. Passionate about TypeScript, modern UI/UX, and cloud-native systems.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'San Francisco, CA (Remote)',
  '{"github": "https://github.com", "linkedin": "https://linkedin.com", "twitter": "https://twitter.com", "email": "alex.rivera.dev@example.com"}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  social_links = EXCLUDED.social_links,
  available_for_hire = EXCLUDED.available_for_hire,
  updated_at = CURRENT_TIMESTAMP;

-- Seed Skills
INSERT INTO skills (id, name, category, proficiency, icon, featured, display_order)
VALUES
  ('sk_ts', 'TypeScript', 'languages', 95, 'typescript', true, 1),
  ('sk_react', 'React / Next.js', 'frontend', 92, 'react', true, 2),
  ('sk_tailwind', 'Tailwind CSS', 'frontend', 90, 'tailwind', true, 3),
  ('sk_node', 'Node.js / Express', 'backend', 94, 'nodejs', true, 4),
  ('sk_postgres', 'PostgreSQL', 'database', 88, 'postgresql', true, 5),
  ('sk_docker', 'Docker & Compose', 'devops', 85, 'docker', true, 6),
  ('sk_jest', 'Vitest & Supertest', 'tools', 89, 'test', false, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  proficiency = EXCLUDED.proficiency,
  icon = EXCLUDED.icon,
  featured = EXCLUDED.featured,
  display_order = EXCLUDED.display_order;

-- Seed Projects
INSERT INTO projects (id, title, slug, description, technologies, demo_url, repo_url, image_url, featured, display_order)
VALUES
  (
    'proj_1',
    'CloudTelemetry Observability Suite',
    'cloud-telemetry-suite',
    'Real-time distributed tracing and metrics platform built for multi-cloud Kubernetes clusters with sub-second query latency.',
    '["TypeScript", "React", "Node.js", "PostgreSQL", "Tailwind CSS"]'::jsonb,
    'https://demo.example.com/telemetry',
    'https://github.com/example/cloud-telemetry',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    true,
    1
  ),
  (
    'proj_2',
    'AI-Powered Code Reviewer',
    'ai-code-reviewer',
    'Automated GitHub pull request review bot utilizing LLM heuristics, AST diffing, and automated test coverage feedback.',
    '["TypeScript", "Next.js", "Express", "Docker"]'::jsonb,
    'https://demo.example.com/reviewer',
    'https://github.com/example/code-reviewer',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    true,
    2
  ),
  (
    'proj_3',
    'High-Throughput Task Engine',
    'task-engine',
    'Reliable background job orchestration engine supporting cron intervals, dead-letter queues, and real-time WebSocket progress tracking.',
    '["Node.js", "PostgreSQL", "Redis", "TypeScript"]'::jsonb,
    'https://demo.example.com/engine',
    'https://github.com/example/task-engine',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    false,
    3
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  technologies = EXCLUDED.technologies,
  demo_url = EXCLUDED.demo_url,
  repo_url = EXCLUDED.repo_url,
  image_url = EXCLUDED.image_url,
  featured = EXCLUDED.featured,
  display_order = EXCLUDED.display_order;
