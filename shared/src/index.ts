/**
 * Standard JSON Response Envelope
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
  };
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Health Check Data
 */
export interface HealthStatus {
  status: 'UP' | 'DOWN';
  database: 'CONNECTED' | 'DISCONNECTED';
  uptimeSeconds: number;
  version: string;
}

/**
 * Profile Entity & API contract
 */
export interface Profile {
  id: string;
  fullName: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  location?: string;
  socialLinks: Record<string, string>;
  availableForHire: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Skill Entity & API contract
 */
export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'languages' | 'tools';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory | string;
  proficiency: number; // 1-100
  icon?: string;
  featured: boolean;
  displayOrder: number;
  createdAt?: string;
}

/**
 * Project Entity & API contract
 */
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  featured: boolean;
  displayOrder: number;
  createdAt?: string;
}

/**
 * Contact Message Entity (Database record)
 */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  ipAddress?: string;
  createdAt: string;
}

/**
 * Contact Submission DTO (POST /api/contact body)
 */
export interface ContactSubmissionDto {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

/**
 * Contact Submission Response
 */
export interface ContactSubmissionResult {
  id: string;
  message: string;
  submittedAt: string;
}

/**
 * Validation Constraints
 */
export const VALIDATION_RULES = {
  NAME: {
    MIN: 2,
    MAX: 120
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX: 255
  },
  SUBJECT: {
    MAX: 200
  },
  MESSAGE: {
    MIN: 10,
    MAX: 2000
  }
} as const;
