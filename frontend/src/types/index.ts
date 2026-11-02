export type {
  ApiResponse,
  HealthStatus,
  Profile,
  Skill,
  SkillCategory,
  Project,
  ContactMessage,
  ContactSubmissionDto,
  ContactSubmissionResult,
} from '@portfolio/shared';

export { VALIDATION_RULES } from '@portfolio/shared';

export interface NavItem {
  label: string;
  href: string;
}

export interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  general?: string;
}

export type SkillFilterCategory = 'all' | 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'languages';
