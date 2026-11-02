import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Profile } from '@/types';

export interface HeroProps {
  profile?: Profile;
}

export const Hero: React.FC<HeroProps> = ({ profile }) => {
  const fullName = profile?.fullName || 'Alex Rivera';
  const title = profile?.title || 'Senior Fullstack Engineer & Cloud Architect';
  const location = profile?.location || 'San Francisco, CA (Remote)';
  const avatarUrl =
    profile?.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const available = profile?.availableForHire ?? true;

  const socialLinks = profile?.socialLinks || {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    email: 'alex.rivera.dev@example.com',
  };

  return (
    <section
      id="hero"
      aria-label="Hero section"
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50/50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            {available && (
              <Badge variant="success" size="md" className="mb-4 gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
                Available for hire & consulting
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-title tracking-tight leading-tight">
              Hi, I'm <span className="text-primary">{fullName}</span>
            </h1>

            <p className="text-h6 text-neutral-secondary font-medium mt-3 mb-4 max-w-xl">
              {title}
            </p>

            <p className="text-body-1 text-neutral-secondary max-w-xl leading-relaxed mb-6">
              I specialize in designing and engineering high-throughput, cloud-native web systems,
              clean backend microservices, and pixel-perfect interactive web interfaces with TypeScript.
            </p>

            <div className="flex items-center gap-2 text-caption text-neutral-secondary mb-8">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
              <a href="#projects">
                <Button variant="primary" size="lg">
                  View Projects
                </Button>
              </a>
              <a href="#contact">
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </a>
            </div>

            {/* Social Icons Bar */}
            <div className="flex items-center gap-4 text-neutral-secondary">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg hover:bg-slate-100 hover:text-neutral-title transition-colors"
                >
                  GitHub
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg hover:bg-slate-100 hover:text-neutral-title transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-2 rounded-lg hover:bg-slate-100 hover:text-neutral-title transition-colors"
                >
                  Twitter
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  aria-label="Email"
                  className="p-2 rounded-lg hover:bg-slate-100 hover:text-neutral-title transition-colors"
                >
                  Email
                </a>
              )}
            </div>
          </div>

          {/* Avatar Image Card */}
          <div className="relative shrink-0 flex items-center justify-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border-4 border-white shadow-xl relative z-10 bg-slate-100">
              <img
                src={avatarUrl}
                alt={`${fullName} profile picture`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-2xl filter blur-xl transform scale-105 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
