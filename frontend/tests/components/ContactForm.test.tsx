import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Contact } from '@/components/sections/Contact';
import { ApiError } from '@/services/api';

describe('Contact Form Component', () => {
  it('renders all form fields and submit button', () => {
    render(<Contact />);

    expect(screen.getByLabelText(/your full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  describe('Client-Side Form Validation', () => {
    it('blocks submission and shows inline errors when required fields are empty', async () => {
      const mockSubmit = jest.fn();
      render(<Contact onSubmitContact={mockSubmit} />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });

    it('shows inline error when name is shorter than 2 characters', async () => {
      const mockSubmit = jest.fn();
      render(<Contact onSubmitContact={mockSubmit} />);

      const nameInput = screen.getByLabelText(/your full name/i);
      fireEvent.change(nameInput, { target: { value: 'A' } });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });

    it('shows inline error when email format is invalid', async () => {
      const mockSubmit = jest.fn();
      render(<Contact onSubmitContact={mockSubmit} />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email-string' } });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    it('shows inline error when message is shorter than 10 characters', async () => {
      const mockSubmit = jest.fn();
      render(<Contact onSubmitContact={mockSubmit} />);

      const messageInput = screen.getByLabelText(/your message/i);
      fireEvent.change(messageInput, { target: { value: 'Too short' } });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      expect(mockSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
    });

    it('clears inline error when user types into the field', async () => {
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      expect(screen.getByText('Name is required')).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/your full name/i);
      fireEvent.change(nameInput, { target: { value: 'Jane' } });

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  describe('API Submission & Feedback Banners', () => {
    it('submits valid data, renders green success banner on HTTP 201, and resets form fields', async () => {
      const mockSubmit = jest.fn().mockResolvedValue({
        id: 'msg_123',
        message: 'Saved successfully',
        submittedAt: new Date().toISOString(),
      });

      render(<Contact onSubmitContact={mockSubmit} />);

      const nameInput = screen.getByLabelText(/your full name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/your message/i) as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(subjectInput, { target: { value: 'Consulting Collaboration' } });
      fireEvent.change(messageInput, {
        target: { value: 'Hello Alex, we would love to discuss a project with your team.' },
      });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Consulting Collaboration',
        message: 'Hello Alex, we would love to discuss a project with your team.',
      });

      // Verify success alert is displayed
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
      });

      // Verify form fields were reset to empty
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(subjectInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });

    it('renders red error alert banner on failure and retains user inputs', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(
        new ApiError('Backend service temporarily unavailable', 500)
      );

      render(<Contact onSubmitContact={mockSubmit} />);

      const nameInput = screen.getByLabelText(/your full name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/your message/i) as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'Important inquiry message about architecture.' } });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });

      // Verify error alert is rendered
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/backend service temporarily unavailable/i)).toBeInTheDocument();
      });

      // Verify user input is retained (NOT cleared)
      expect(nameInput.value).toBe('Jane Doe');
      expect(emailInput.value).toBe('jane@example.com');
      expect(messageInput.value).toBe('Important inquiry message about architecture.');
    });

    it('maps backend HTTP 400 validation error details to inline field errors', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(
        new ApiError('Validation failed', 400, [
          { field: 'email', issue: 'Email domain is blacklisted' },
        ])
      );

      render(<Contact onSubmitContact={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@blacklisted.com' } });
      fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: 'Valid inquiry message here.' } });

      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Email domain is blacklisted')).toBeInTheDocument();
      });
    });

    it('disables submit button and shows loading state during submission', async () => {
      let resolvePromise: (val: any) => void = () => {};
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      const mockSubmit = jest.fn().mockReturnValue(pendingPromise);

      render(<Contact onSubmitContact={mockSubmit} />);

      fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: 'Valid inquiry message here.' } });

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      // Verify loading state
      expect(submitButton).toBeDisabled();
      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

      // Resolve API call
      resolvePromise({ id: '1', message: 'done', submittedAt: '' });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });
});
