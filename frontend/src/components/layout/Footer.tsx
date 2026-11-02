import React from 'react';

export interface FooterProps {
  fullName?: string;
  socialLinks?: Record<string, string>;
}

export const Footer: React.FC<FooterProps> = ({
  fullName = 'Alex Rivera',
  socialLinks = {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
    email: 'alex.rivera.dev@example.com',
  },
}) => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentYear = 2026;

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-white font-bold text-lg">{fullName}</span>
            <p className="text-caption text-slate-400 mt-1">
              Building scalable web architectures & cloud-native systems.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="hover:text-white transition-colors"
              >
                Twitter
              </a>
            )}
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                aria-label="Send Email"
                className="hover:text-white transition-colors"
              >
                Email
              </a>
            )}
          </div>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            className="flex items-center gap-2 text-caption text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span>Back to top</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        {/* Copyright notice */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-caption text-slate-500">
          <p>© {currentYear} {fullName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
