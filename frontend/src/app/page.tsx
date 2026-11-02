'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Projects } from '@/components/sections/Projects';
import { Contact } from '@/components/sections/Contact';
import {
  Profile,
  Skill,
  Project,
} from '@/types';
import {
  getProfile,
  getSkills,
  getProjects,
  DEFAULT_PROFILE,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
} from '@/services/portfolio';

export default function HomePage() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [skills, setSkills] = useState<Skill[]>(DEFAULT_SKILLS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolioData() {
      try {
        const [profileData, skillsData, projectsData] = await Promise.all([
          getProfile(),
          getSkills(),
          getProjects(),
        ]);

        if (isMounted) {
          if (profileData) setProfile(profileData);
          if (skillsData && skillsData.length > 0) setSkills(skillsData);
          if (projectsData && projectsData.length > 0) setProjects(projectsData);
        }
      } catch (err) {
        // Fallbacks already in state
      }
    }

    loadPortfolioData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-layout">
      {/* Fixed Navigation Header */}
      <Navbar brandName={profile.fullName} brandTitle={profile.title} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero profile={profile} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Contact />
      </main>

      {/* Global Footer */}
      <Footer fullName={profile.fullName} socialLinks={profile.socialLinks} />
    </div>
  );
}
