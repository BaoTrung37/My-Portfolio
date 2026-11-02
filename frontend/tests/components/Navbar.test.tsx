import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';

describe('Navbar Component', () => {
  it('renders brand name and title', () => {
    render(<Navbar brandName="Alex Rivera" brandTitle="Senior Fullstack Engineer" />);

    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Senior Fullstack Engineer')).toBeInTheDocument();
  });

  it('renders all core desktop navigation links with correct hrefs', () => {
    render(<Navbar />);

    const aboutLinks = screen.getAllByRole('link', { name: /^about$/i });
    expect(aboutLinks[0]).toHaveAttribute('href', '#about');

    const skillsLinks = screen.getAllByRole('link', { name: /^skills$/i });
    expect(skillsLinks[0]).toHaveAttribute('href', '#skills');

    const projectsLinks = screen.getAllByRole('link', { name: /^projects$/i });
    expect(projectsLinks[0]).toHaveAttribute('href', '#projects');

    const contactLinks = screen.getAllByRole('link', { name: /^contact$/i });
    expect(contactLinks[0]).toHaveAttribute('href', '#contact');
  });

  it('renders "Hire Me" call-to-action button', () => {
    render(<Navbar />);

    const hireButtons = screen.getAllByRole('button', { name: /hire me/i });
    expect(hireButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles mobile menu drawer on hamburger click', () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

    // Close menu
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('closes mobile menu when a mobile nav link is clicked', () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(toggleButton);

    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeInTheDocument();

    const mobileAboutLink = mobileMenu.querySelector('a[href="#about"]');
    expect(mobileAboutLink).toBeInTheDocument();
    if (mobileAboutLink) {
      fireEvent.click(mobileAboutLink);
    }

    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });

  it('closes mobile menu when Escape key is pressed', () => {
    render(<Navbar />);

    const toggleButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
  });
});
