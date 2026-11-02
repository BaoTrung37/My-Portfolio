import React from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Card, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Profile } from '@/types';

export interface AboutProps {
  profile?: Profile;
}

export const About: React.FC<AboutProps> = ({ profile }) => {
  const bio =
    profile?.bio ||
    'Dedicated software engineer with 7+ years of experience crafting high-performance, resilient web platforms and developer-centric tooling. Passionate about TypeScript, modern UI/UX, and cloud-native systems.';
  const location = profile?.location || 'San Francisco, CA (Remote)';

  const highlights = [
    {
      title: '7+ Years Experience',
      description: 'Building production-grade web systems, distributed architectures, and microservices.',
      icon: '💼',
    },
    {
      title: 'Clean Architecture',
      description: 'Strict adherence to SOLID principles, modular patterns, and comprehensive type safety.',
      icon: '🏛️',
    },
    {
      title: 'Automated Quality',
      description: 'Relentless focus on zero-failure testing pipelines (unit, integration, and E2E suites).',
      icon: '🛡️',
    },
    {
      title: 'Cloud & DevOps',
      description: 'Proficiency in containerization, PostgreSQL tuning, CI/CD automation, and cloud deployments.',
      icon: '☁️',
    },
  ];

  return (
    <section id="about" aria-label="About Me section" className="py-20 md:py-28 bg-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="About Me"
          subtitle="A deeper look into my background, engineering philosophy, and the principles driving my work."
          badge="Background"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Narrative Bio */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="text-h6 text-neutral-title font-bold">
              Engineering Scalable Solutions with Precision & Craftsmanship
            </h3>

            <p className="text-body-1 text-neutral-secondary leading-relaxed">
              {bio}
            </p>

            <p className="text-body-1 text-neutral-secondary leading-relaxed">
              Throughout my engineering journey, I have prioritized building software that is maintainable,
              auditable, and performant. I believe that good software architecture is not just about lines of code,
              but about crafting resilient systems that adapt gracefully to evolving business demands.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Badge variant="neutral" size="md">
                📍 {location}
              </Badge>
              <Badge variant="primary" size="md">
                ⚡ Fullstack TypeScript
              </Badge>
              <Badge variant="success" size="md">
                🚀 Open to Collaborations
              </Badge>
            </div>
          </div>

          {/* Key Engineering Pillars */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {highlights.map((item, idx) => (
              <Card key={idx} hoverEffect className="border-neutral-divider/80">
                <CardContent className="p-4 flex items-start gap-4">
                  <span className="text-2xl shrink-0 p-2 rounded-lg bg-slate-50 border border-neutral-divider/60">
                    {item.icon}
                  </span>
                  <div>
                    <h4 className="text-body-1 font-semibold text-neutral-title">
                      {item.title}
                    </h4>
                    <p className="text-caption text-neutral-secondary mt-1 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
