import { z } from 'zod';
import { ContactSubmissionDto, VALIDATION_RULES } from '@portfolio/shared';

export interface ValidationIssue {
  field: string;
  issue: string;
}

export const contactSubmissionSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required and must be a string',
      invalid_type_error: 'Name is required and must be a string'
    })
    .transform((val) => val.trim())
    .refine((val) => val.length >= VALIDATION_RULES.NAME.MIN, {
      message: `Name must be at least ${VALIDATION_RULES.NAME.MIN} characters`
    })
    .refine((val) => val.length <= VALIDATION_RULES.NAME.MAX, {
      message: `Name must not exceed ${VALIDATION_RULES.NAME.MAX} characters`
    }),
  email: z
    .string({
      required_error: 'Email is required and must be a string',
      invalid_type_error: 'Email is required and must be a string'
    })
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, {
      message: 'Email is required'
    })
    .refine((val) => val.length <= VALIDATION_RULES.EMAIL.MAX, {
      message: `Email must not exceed ${VALIDATION_RULES.EMAIL.MAX} characters`
    })
    .refine((val) => VALIDATION_RULES.EMAIL.REGEX.test(val), {
      message: 'A valid email address is required'
    }),
  subject: z.preprocess(
    (val) => (val === null || val === undefined ? undefined : val),
    z
      .string({ invalid_type_error: 'Subject must be a string' })
      .transform((val) => val.trim())
      .refine((val) => val.length <= VALIDATION_RULES.SUBJECT.MAX, {
        message: `Subject must not exceed ${VALIDATION_RULES.SUBJECT.MAX} characters`
      })
      .optional()
  ),
  message: z
    .string({
      required_error: 'Message is required and must be a string',
      invalid_type_error: 'Message is required and must be a string'
    })
    .transform((val) => val.trim())
    .refine((val) => val.length >= VALIDATION_RULES.MESSAGE.MIN, {
      message: `Message must be at least ${VALIDATION_RULES.MESSAGE.MIN} characters`
    })
    .refine((val) => val.length <= VALIDATION_RULES.MESSAGE.MAX, {
      message: `Message must not exceed ${VALIDATION_RULES.MESSAGE.MAX} characters`
    })
});

export function validateContactSubmission(body: any): {
  valid: boolean;
  data?: ContactSubmissionDto;
  issues: ValidationIssue[];
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      issues: [{ field: 'body', issue: 'Request body must be a JSON object' }]
    };
  }

  const result = contactSubmissionSchema.safeParse(body);
  if (!result.success) {
    const issues: ValidationIssue[] = result.error.issues.map((err) => ({
      field: (err.path[0] as string) || 'body',
      issue: err.message
    }));
    return {
      valid: false,
      issues
    };
  }

  return {
    valid: true,
    data: result.data as ContactSubmissionDto,
    issues: []
  };
}

