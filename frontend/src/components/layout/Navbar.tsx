import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';

export interface NavbarProps {
  brandName?: string;
  brandTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  brandName = 'Alex Rivera',
  brandTitle = 'Fullstack Engineer',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-container/95 backdrop-blur-md shadow-sm border-b border-neutral-divider'
          : 'bg-container/80 backdrop-blur-sm border-b border-neutral-divider/40'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
        >
          <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-primary-hover transition-colors">
            AR
          </span>
          <div className="flex flex-col">
            <span className="text-h6 text-neutral-title font-bold leading-none tracking-tight">
              {brandName}
            </span>
            <span className="text-caption text-neutral-secondary text-xs mt-0.5">
              {brandTitle}
            </span>
          </div>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-1 text-neutral-secondary font-medium hover:text-primary transition-colors py-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact">
            <Button variant="primary" size="sm">
              Hire Me
            </Button>
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden p-2 rounded-lg text-neutral-secondary hover:text-neutral-title hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden border-b border-neutral-divider bg-container px-4 pt-2 pb-6 shadow-lg animate-fadeIn"
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-body-1 font-medium text-neutral-secondary hover:text-primary hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a href="#contact" onClick={closeMenu} className="w-full block">
                <Button variant="primary" fullWidth size="md">
                  Hire Me
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
