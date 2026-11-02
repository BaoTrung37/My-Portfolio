import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Skill, SkillCategory } from '@/types';
import { DEFAULT_SKILLS } from '@/services/portfolio';

export interface SkillsProps {
  skills?: Skill[];
}

export const Skills: React.FC<SkillsProps> = ({ skills = DEFAULT_SKILLS }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { key: 'all', label: 'All Disciplines' },
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend', label: 'Backend' },
    { key: 'database', label: 'Database' },
    { key: 'devops', label: 'DevOps & Cloud' },
    { key: 'languages', label: 'Languages' },
    { key: 'tools', label: 'Tools & Testing' },
  ];

  const filteredSkills = skills.filter((skill) => {
    if (selectedCategory === 'all') return true;
    return skill.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'frontend':
        return 'primary';
      case 'backend':
        return 'warning';
      case 'database':
        return 'success';
      case 'devops':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <section id="skills" aria-label="Skills showcase section" className="py-20 md:py-28 bg-layout border-t border-neutral-divider/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Technical Skills & Expertise"
          subtitle="A comprehensive overview of my technical toolstack, language proficiencies, and system design expertise."
          badge="Proficiencies"
        />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-caption font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-container text-neutral-secondary border border-neutral-divider hover:border-slate-300 hover:text-neutral-title'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Skills Cards Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-12 bg-container rounded-xl border border-neutral-divider">
            <p className="text-body-1 text-neutral-secondary">No skills found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} hoverEffect className="border-neutral-divider/80">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-h6 text-neutral-title font-semibold truncate">
                      {skill.name}
                    </span>
                    <Badge variant={getCategoryBadgeVariant(skill.category)} size="sm">
                      {skill.category}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-caption text-neutral-secondary mb-1.5">
                      <span>Proficiency</span>
                      <span className="font-semibold text-neutral-title">{skill.proficiency}%</span>
                    </div>
                    {/* Proficiency progress bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${skill.proficiency}%` }}
                        role="progressbar"
                        aria-valuenow={skill.proficiency}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.name} proficiency`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
