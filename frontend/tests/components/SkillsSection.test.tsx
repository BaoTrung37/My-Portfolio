import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Skills } from '@/components/sections/Skills';
import { Skill } from '@/types';

const mockSkills: Skill[] = [
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
    id: 'sk_node',
    name: 'Node.js / Express',
    category: 'backend',
    proficiency: 94,
    icon: 'nodejs',
    featured: true,
    displayOrder: 3,
  },
  {
    id: 'sk_pg',
    name: 'PostgreSQL',
    category: 'database',
    proficiency: 88,
    icon: 'postgresql',
    featured: true,
    displayOrder: 4,
  },
  {
    id: 'sk_docker',
    name: 'Docker & Compose',
    category: 'devops',
    proficiency: 85,
    icon: 'docker',
    featured: true,
    displayOrder: 5,
  },
];

describe('Skills Section Component', () => {
  it('renders section header with title', () => {
    render(<Skills skills={mockSkills} />);

    expect(screen.getByText('Technical Skills & Expertise')).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    render(<Skills skills={mockSkills} />);

    expect(screen.getByRole('button', { name: /all disciplines/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /frontend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /backend/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /devops & cloud/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /languages/i })).toBeInTheDocument();
  });

  it('renders all skills by default with proficiency progressbars', () => {
    render(<Skills skills={mockSkills} />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React / Next.js')).toBeInTheDocument();
    expect(screen.getByText('Node.js / Express')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('Docker & Compose')).toBeInTheDocument();

    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBe(5);
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '95');
  });

  it('filters skills when a category pill is clicked', () => {
    render(<Skills skills={mockSkills} />);

    const frontendFilter = screen.getByRole('button', { name: /frontend/i });
    fireEvent.click(frontendFilter);

    expect(screen.getByText('React / Next.js')).toBeInTheDocument();
    expect(screen.queryByText('Node.js / Express')).not.toBeInTheDocument();
    expect(screen.queryByText('PostgreSQL')).not.toBeInTheDocument();

    const backendFilter = screen.getByRole('button', { name: /backend/i });
    fireEvent.click(backendFilter);

    expect(screen.getByText('Node.js / Express')).toBeInTheDocument();
    expect(screen.queryByText('React / Next.js')).not.toBeInTheDocument();

    const allFilter = screen.getByRole('button', { name: /all disciplines/i });
    fireEvent.click(allFilter);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React / Next.js')).toBeInTheDocument();
    expect(screen.getByText('Node.js / Express')).toBeInTheDocument();
  });

  it('renders empty state message when a filtered category contains no skills', () => {
    const limitedSkills: Skill[] = [
      {
        id: 'sk_ts',
        name: 'TypeScript',
        category: 'languages',
        proficiency: 95,
        featured: true,
        displayOrder: 1,
      },
    ];

    render(<Skills skills={limitedSkills} />);

    const frontendFilter = screen.getByRole('button', { name: /frontend/i });
    fireEvent.click(frontendFilter);

    expect(screen.getByText(/no skills found for this category/i)).toBeInTheDocument();
  });
});
