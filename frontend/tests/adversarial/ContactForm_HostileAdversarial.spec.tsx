import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Contact } from '@/components/sections/Contact';
import { ApiError } from '@/services/api';

describe('Contact Form Hostile Adversarial Stress & Double-Submit Testing', () => {
  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Adversarial Tester' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'tester@hostile-security.org' } });
    fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: 'Penetration Stress Test' } });
    fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: 'This message is sent under extreme burst conditions.' } });
  };

  it('1. Extreme Burst: prevents multiple submissions when user spams submit button 50 times in rapid succession', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockSubmit = jest.fn().mockReturnValue(pendingPromise);
    render(<Contact onSubmitContact={mockSubmit} />);
    fillValidForm();

    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Spam submit button 50 times
    for (let i = 0; i < 50; i++) {
      fireEvent.click(submitButton);
    }

    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Resolve in-flight request
    resolvePromise({ id: 'msg_burst_1', message: 'Success', submittedAt: new Date().toISOString() });
    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('2. Mixed Input Spam: resists simultaneous clicks, form submits, and Enter key spam while in-flight', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockSubmit = jest.fn().mockReturnValue(pendingPromise);
    const { container } = render(<Contact onSubmitContact={mockSubmit} />);
    fillValidForm();

    const form = container.querySelector('form')!;
    const submitButton = screen.getByRole('button', { name: /send message/i });
    const nameInput = screen.getByLabelText(/your full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    // Fire initial submit
    fireEvent.click(submitButton);
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Now while in-flight, spam from all different vector sources
    for (let i = 0; i < 10; i++) {
      fireEvent.submit(form);
      fireEvent.click(submitButton);
      fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' });
    }

    // Must still be called exactly once
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    resolvePromise({ id: 'msg_mixed_1', message: 'Success', submittedAt: new Date().toISOString() });
    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('3. In-Flight Latency & UI Lockout: disables inputs and shows loading state during network latency', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockSubmit = jest.fn().mockReturnValue(pendingPromise);
    render(<Contact onSubmitContact={mockSubmit} />);
    fillValidForm();

    const nameInput = screen.getByLabelText(/your full name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/your message/i) as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /send message/i }) as HTMLButtonElement;

    // Verify initial enabled state
    expect(nameInput.disabled).toBe(false);
    expect(emailInput.disabled).toBe(false);
    expect(subjectInput.disabled).toBe(false);
    expect(messageInput.disabled).toBe(false);
    expect(submitButton.disabled).toBe(false);

    // Initiate submission
    fireEvent.click(submitButton);

    // Under latency, all inputs and button must be disabled
    expect(nameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
    expect(subjectInput.disabled).toBe(true);
    expect(messageInput.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

    // Resolve latency
    resolvePromise({ id: 'msg_latency_1', message: 'Success', submittedAt: new Date().toISOString() });

    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });

    // Post-success: inputs and button re-enabled, form reset
    expect(nameInput.disabled).toBe(false);
    expect(submitButton.disabled).toBe(false);
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(messageInput.value).toBe('');
  });

  it('4. Error Recovery & Safe Re-submission: unlocks form on failure and allows corrected re-submission with double-submit protection', async () => {
    let rejectPromise: (err: any) => void = () => {};
    let firstPromise = new Promise((_, reject) => {
      rejectPromise = reject;
    });

    const mockSubmit = jest.fn()
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => Promise.resolve({ id: 'msg_retry_2', message: 'Success', submittedAt: new Date().toISOString() }));

    const { container } = render(<Contact onSubmitContact={mockSubmit} />);
    fillValidForm();

    const form = container.querySelector('form')!;
    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Submit attempt 1
    fireEvent.click(submitButton);
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Attempt double click while in-flight
    fireEvent.click(submitButton);
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Reject attempt 1 with ApiError
    act(() => {
      rejectPromise(new ApiError('Backend temporarily overloaded', 503, undefined, 'SERVICE_UNAVAILABLE'));
    });

    await waitFor(() => {
      expect(screen.getByText(/backend temporarily overloaded/i)).toBeInTheDocument();
    });

    // Form data must be preserved so user does not lose input
    const messageInput = screen.getByLabelText(/your message/i) as HTMLTextAreaElement;
    expect(messageInput.value).toBe('This message is sent under extreme burst conditions.');

    // Now retry submission (Attempt 2)
    fireEvent.click(submitButton);
    // Double click during attempt 2
    fireEvent.click(submitButton);

    // Should have been called exactly 2 times (1 for attempt 1, 1 for attempt 2)
    expect(mockSubmit).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('5. Validation Failures: invalid inputs do not trigger submit or lock form in submitting state', async () => {
    const mockSubmit = jest.fn();
    render(<Contact onSubmitContact={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Spam submit button while form is completely empty
    for (let i = 0; i < 5; i++) {
      fireEvent.click(submitButton);
    }

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();

    // Now fill valid details and verify it submits normally
    fillValidForm();
    mockSubmit.mockResolvedValueOnce({ id: 'msg_after_val_1', message: 'Success', submittedAt: new Date().toISOString() });

    fireEvent.click(submitButton);
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('6. Unhandled Synchronous & Asynchronous Exception Resilience: recovers from unexpected exception', async () => {
    const mockSubmit = jest.fn().mockRejectedValueOnce(new Error('Fatal Network Disconnection'));
    render(<Contact onSubmitContact={mockSubmit} />);
    fillValidForm();

    const submitButton = screen.getByRole('button', { name: /send message/i });

    fireEvent.click(submitButton);
    expect(mockSubmit).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/fatal network disconnection/i)).toBeInTheDocument();
    });

    // Submit button must not be stuck in loading/disabled state
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
  });
});
