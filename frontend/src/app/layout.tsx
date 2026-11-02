import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Alex Rivera | Senior Fullstack Engineer & Cloud Architect',
  description:
    'Dedicated software engineer specializing in scalable web systems, clean architecture, and modern fullstack development with TypeScript.',
  keywords: [
    'Alex Rivera',
    'Fullstack Engineer',
    'Cloud Architect',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Docker',
  ],
  authors: [{ name: 'Alex Rivera' }],
  openGraph: {
    title: 'Alex Rivera | Senior Fullstack Engineer & Cloud Architect',
    description:
      'Explore projects, skills, and architectural designs by Alex Rivera.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Alex Rivera Portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-layout text-neutral-title antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
