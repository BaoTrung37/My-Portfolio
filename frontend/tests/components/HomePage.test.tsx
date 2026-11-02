import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage Full Integration Test', () => {
  it('renders complete portfolio page with all sections without crashing', async () => {
    render(<HomePage />);

    // Header & Navbar
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view projects/i })).toBeInTheDocument();

    // Main Content
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Hero Section
    expect(screen.getByRole('region', { name: /hero section/i })).toBeInTheDocument();

    // About Section
    expect(screen.getByRole('region', { name: /about me section/i })).toBeInTheDocument();

    // Skills Section
    expect(screen.getByRole('region', { name: /skills showcase section/i })).toBeInTheDocument();

    // Projects Section
    expect(screen.getByRole('region', { name: /projects showcase section/i })).toBeInTheDocument();

    // Contact Section
    expect(screen.getByRole('region', { name: /contact section/i })).toBeInTheDocument();

    // Footer
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
