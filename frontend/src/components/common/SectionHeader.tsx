import React from 'react';
import { Badge } from './Badge';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  align = 'center',
  className = '',
}) => {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-2.5 mb-10 ${alignClass} ${className}`.trim()}>
      {badge && (
        <Badge variant="primary" size="md" className="mb-1">
          {badge}
        </Badge>
      )}
      <h2 className="text-h4 text-neutral-title tracking-tight">{title}</h2>
      <div className="w-16 h-1 bg-primary rounded-full" />
      {subtitle && (
        <p className="text-subtitle-1 text-neutral-secondary max-w-2xl leading-relaxed mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
