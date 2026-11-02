import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Card, CardContent, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Project } from '@/types';
import { DEFAULT_PROJECTS } from '@/services/portfolio';

export interface ProjectsProps {
  projects?: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects = DEFAULT_PROJECTS }) => {
  const [filter, setFilter] = useState<'all' | 'featured'>('all');

  const filteredProjects = projects.filter((project) => {
    if (filter === 'featured') return project.featured;
    return true;
  });

  return (
    <section id="projects" aria-label="Projects showcase section" className="py-20 md:py-28 bg-container border-t border-neutral-divider/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Projects & Work"
          subtitle="A selection of high-impact web architectures, open-source utilities, and fullstack platforms I have engineered."
          badge="Portfolio"
        />

        {/* Filter Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-caption font-medium transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-neutral-secondary hover:text-neutral-title'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('featured')}
            className={`px-4 py-1.5 rounded-full text-caption font-medium transition-all ${
              filter === 'featured'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-neutral-secondary hover:text-neutral-title'
            }`}
          >
            Featured Only
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              hoverEffect
              className="flex flex-col justify-between border-neutral-divider/80"
            >
              <div>
                {/* Thumbnail Preview */}
                {project.imageUrl && (
                  <div className="w-full h-48 overflow-hidden bg-slate-100 relative group">
                    <img
                      src={project.imageUrl}
                      alt={`${project.title} preview`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {project.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="warning" size="sm">
                          ★ Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-6">
                  <h3 className="text-h6 text-neutral-title font-bold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-body-1 text-sm text-neutral-secondary leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Technology Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech: string, idx: number) => (
                      <Badge key={idx} variant="primary" size="sm">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <CardFooter className="p-4 bg-slate-50/70 gap-3">
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="primary" size="sm" fullWidth>
                      Live Demo
                    </Button>
                  </a>
                ) : (
                  <div className="flex-1" />
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" fullWidth>
                      Source Code
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
