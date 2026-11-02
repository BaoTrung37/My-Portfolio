import React from 'react';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Profile } from '@/types';

const mockProfile: Profile = {
  id: 'prof_test',
  fullName: 'Alex Rivera',
  title: 'Senior Fullstack Engineer & Cloud Architect',
  bio: 'A passionate engineer specializing in resilient microservices and high-performance frontend interfaces.',
  avatarUrl: 'https://example.com/avatar.jpg',
  location: 'San Francisco, CA (Remote)',
  socialLinks: {
    github: 'https://github.com/alexrivera',
    linkedin: 'https://linkedin.com/in/alexrivera',
    twitter: 'https://twitter.com/alexrivera',
    email: 'alex@example.com',
  },
  availableForHire: true,
};

describe('Hero & About Sections', () => {
  describe('Hero Component', () => {
    it('renders candidate name and professional title', () => {
      render(<Hero profile={mockProfile} />);

      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Senior Fullstack Engineer & Cloud Architect')).toBeInTheDocument();
    });

    it('displays availability status badge when availableForHire is true', () => {
      render(<Hero profile={mockProfile} />);

      expect(screen.getByText(/available for hire/i)).toBeInTheDocument();
    });

    it('displays location tag with map marker', () => {
      render(<Hero profile={mockProfile} />);

      expect(screen.getByText('San Francisco, CA (Remote)')).toBeInTheDocument();
    });

    it('renders call to action buttons with anchor links', () => {
      render(<Hero profile={mockProfile} />);

      const viewProjectsLink = screen.getByRole('link', { name: /view projects/i });
      expect(viewProjectsLink).toHaveAttribute('href', '#projects');

      const contactLink = screen.getByRole('link', { name: /get in touch/i });
      expect(contactLink).toHaveAttribute('href', '#contact');
    });

    it('renders social profile links with target="_blank"', () => {
      render(<Hero profile={mockProfile} />);

      const githubLink = screen.getByRole('link', { name: /^github$/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/alexrivera');
      expect(githubLink).toHaveAttribute('target', '_blank');

      const linkedinLink = screen.getByRole('link', { name: /^linkedin$/i });
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/alexrivera');

      const emailLink = screen.getByRole('link', { name: /^email$/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:alex@example.com');
    });

    it('renders avatar image with appropriate alt text', () => {
      render(<Hero profile={mockProfile} />);

      const avatar = screen.getByAltText(/Alex Rivera profile picture/i);
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('About Component', () => {
    it('renders SectionHeader and narrative bio', () => {
      render(<About profile={mockProfile} />);

      expect(screen.getByText('About Me')).toBeInTheDocument();
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
    });

    it('renders engineering highlights cards', () => {
      render(<About profile={mockProfile} />);

      expect(screen.getByText('7+ Years Experience')).toBeInTheDocument();
      expect(screen.getByText('Clean Architecture')).toBeInTheDocument();
      expect(screen.getByText('Automated Quality')).toBeInTheDocument();
      expect(screen.getByText('Cloud & DevOps')).toBeInTheDocument();
    });

    it('renders location and stack badge pills', () => {
      render(<About profile={mockProfile} />);

      expect(screen.getByText(/San Francisco, CA \(Remote\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Fullstack TypeScript/i)).toBeInTheDocument();
    });
  });
});
