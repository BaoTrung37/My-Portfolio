import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Card, CardContent } from '../common/Card';
import { ContactFormState, ContactFormErrors, ContactSubmissionDto, ContactSubmissionResult } from '@/types';
import { submitContact } from '@/services/portfolio';
import { ApiError } from '@/services/api';

export interface ContactProps {
  onSubmitContact?: (data: ContactSubmissionDto) => Promise<ContactSubmissionResult>;
}

export const Contact: React.FC<ContactProps> = ({ onSubmitContact = submitContact }) => {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field: keyof ContactFormState, value: string): string | undefined => {
    const trimmed = value.trim();
    switch (field) {
      case 'name':
        if (!trimmed) return 'Name is required';
        if (trimmed.length < 2) return 'Name must be at least 2 characters long';
        if (trimmed.length > 120) return 'Name cannot exceed 120 characters';
        return undefined;

      case 'email':
        if (!trimmed) return 'Email is required';
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
        if (trimmed.length > 255) return 'Email cannot exceed 255 characters';
        return undefined;

      case 'subject':
        if (trimmed.length > 200) return 'Subject cannot exceed 200 characters';
        return undefined;

      case 'message':
        if (!trimmed) return 'Message is required';
        if (trimmed.length < 10) return 'Message must be at least 10 characters long';
        if (trimmed.length > 2000) return 'Message cannot exceed 2000 characters';
        return undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};

    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const subjectError = validateField('subject', formData.subject);
    if (subjectError) newErrors.subject = subjectError;

    const messageError = validateField('message', formData.message);
    if (messageError) newErrors.message = messageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error when typing
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name as keyof ContactFormErrors];
        return copy;
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldError = validateField(name as keyof ContactFormState, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setFeedback(null);

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ContactSubmissionDto = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
      };

      await onSubmitContact(payload);

      // On HTTP 201 Success: show green success alert & reset form
      setFeedback({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully. I will get back to you shortly.',
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});
    } catch (err: any) {
      // On failure: show red error banner & retain form input
      let errorMsg = 'Failed to submit inquiry. Please verify your details and try again.';

      if (err instanceof ApiError) {
        errorMsg = err.message || errorMsg;

        if (err.details && Array.isArray(err.details)) {
          const backendFieldErrors: ContactFormErrors = {};
          err.details.forEach((d) => {
            if (d.field && ['name', 'email', 'subject', 'message'].includes(d.field)) {
              backendFieldErrors[d.field as keyof ContactFormErrors] = d.issue;
            }
          });
          if (Object.keys(backendFieldErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...backendFieldErrors }));
          }
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }

      setFeedback({
        type: 'error',
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" aria-label="Contact section" className="py-20 md:py-28 bg-layout border-t border-neutral-divider/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Get In Touch"
          subtitle="Have a project in mind, an architectural challenge, or a consulting opportunity? Drop me a message below."
          badge="Inquiries"
        />

        <Card className="border-neutral-divider shadow-md bg-container">
          <CardContent className="p-6 sm:p-8 md:p-10">
            {/* Feedback Alert Banners */}
            {feedback && (
              <div className="mb-6">
                <Alert
                  variant={feedback.type}
                  title={feedback.type === 'success' ? 'Success' : 'Submission Failed'}
                  message={feedback.message}
                  onClose={() => setFeedback(null)}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name Field */}
                <Input
                  id="contact-name"
                  name="name"
                  label="Your Full Name"
                  placeholder="Jane Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.name}
                  disabled={isSubmitting}
                />

                {/* Email Field */}
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="jane@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  disabled={isSubmitting}
                />
              </div>

              {/* Subject Field */}
              <Input
                id="contact-subject"
                name="subject"
                label="Subject (Optional)"
                placeholder="Senior Fullstack Contract / Consulting Inquiry"
                maxLength={200}
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.subject}
                disabled={isSubmitting}
              />

              {/* Message Field */}
              <TextArea
                id="contact-message"
                name="message"
                label="Your Message"
                placeholder="Please describe your project, timeline, and goals..."
                required
                rows={5}
                maxLength={2000}
                showCount
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.message}
                disabled={isSubmitting}
              />

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto min-w-[160px]"
                >
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
