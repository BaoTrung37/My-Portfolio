import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Projects } from '@/components/sections/Projects';
import { Project } from '@/types';

const mockProjects: Project[] = [
  {
    id: 'proj_1',
    title: 'CloudTelemetry Observability Suite',
    slug: 'cloud-telemetry-suite',
    description: 'Real-time distributed tracing and metrics platform built for multi-cloud Kubernetes clusters.',
    technologies: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    demoUrl: 'https://demo.example.com/telemetry',
    repoUrl: 'https://github.com/example/cloud-telemetry',
    imageUrl: 'https://example.com/proj1.jpg',
    featured: true,
    displayOrder: 1,
  },
  {
    id: 'proj_2',
    title: 'High-Throughput Task Engine',
    slug: 'task-engine',
    description: 'Reliable background job orchestration engine supporting cron intervals and Redis queues.',
    technologies: ['Node.js', 'PostgreSQL', 'Redis'],
    demoUrl: undefined, // no demo link
    repoUrl: 'https://github.com/example/task-engine',
    imageUrl: 'https://example.com/proj2.jpg',
    featured: false,
    displayOrder: 2,
  },
];

describe('Projects Section Component', () => {
  it('renders section header with title', () => {
    render(<Projects projects={mockProjects} />);

    expect(screen.getByText('Featured Projects & Work')).toBeInTheDocument();
  });

  it('renders project cards with titles, descriptions, and technology tags', () => {
    render(<Projects projects={mockProjects} />);

    expect(screen.getByText('CloudTelemetry Observability Suite')).toBeInTheDocument();
    expect(screen.getByText('High-Throughput Task Engine')).toBeInTheDocument();

    expect(screen.getByText(/Real-time distributed tracing/i)).toBeInTheDocument();

    // Tech tags
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
  });

  it('renders "Live Demo" button with target="_blank" when demoUrl is provided', () => {
    render(<Projects projects={mockProjects} />);

    const liveDemoLink = screen.getByRole('link', { name: /live demo/i });
    expect(liveDemoLink).toHaveAttribute('href', 'https://demo.example.com/telemetry');
    expect(liveDemoLink).toHaveAttribute('target', '_blank');
    expect(liveDemoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders "Source Code" button with target="_blank" when repoUrl is provided', () => {
    render(<Projects projects={mockProjects} />);

    const sourceCodeLinks = screen.getAllByRole('link', { name: /source code/i });
    expect(sourceCodeLinks.length).toBe(2);
    expect(sourceCodeLinks[0]).toHaveAttribute('href', 'https://github.com/example/cloud-telemetry');
    expect(sourceCodeLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('filters to only featured projects when "Featured Only" is clicked', () => {
    render(<Projects projects={mockProjects} />);

    const featuredButton = screen.getByRole('button', { name: /featured only/i });
    fireEvent.click(featuredButton);

    expect(screen.getByText('CloudTelemetry Observability Suite')).toBeInTheDocument();
    expect(screen.queryByText('High-Throughput Task Engine')).not.toBeInTheDocument();

    const allButton = screen.getByRole('button', { name: /all projects/i });
    fireEvent.click(allButton);

    expect(screen.getByText('CloudTelemetry Observability Suite')).toBeInTheDocument();
    expect(screen.getByText('High-Throughput Task Engine')).toBeInTheDocument();
  });

  it('omits Live Demo button if demoUrl is not present', () => {
    render(<Projects projects={[mockProjects[1]]} />);

    expect(screen.queryByRole('link', { name: /live demo/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /source code/i })).toBeInTheDocument();
  });
});
