import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Contact } from '@/components/sections/Contact';

describe('Contact Form Double-Submit & Rapid Firing Resilience', () => {
  it('prevents multiple submissions when form submit is fired multiple times while in-flight', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockSubmit = jest.fn().mockReturnValue(pendingPromise);

    const { container } = render(<Contact onSubmitContact={mockSubmit} />);

    // Fill valid data
    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: 'Valid inquiry message here for testing.' } });

    const form = container.querySelector('form')!;
    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Rapid double-firing: user double-clicks or triggers submit twice
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mockSubmit).toHaveBeenCalledTimes(1);

    // Resolve in-flight request
    resolvePromise({ id: 'msg_1', message: 'Success', submittedAt: new Date().toISOString() });
    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });

  it('prevents multiple submissions when user double clicks submit button before DOM disables it', async () => {
    let resolvePromise: (val: any) => void = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockSubmit = jest.fn().mockReturnValue(pendingPromise);

    render(<Contact onSubmitContact={mockSubmit} />);

    // Fill valid data
    fireEvent.change(screen.getByLabelText(/your full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/your message/i), { target: { value: 'Valid inquiry message here for testing.' } });

    const submitButton = screen.getByRole('button', { name: /send message/i });

    // Simulate two rapid clicks in quick succession
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledTimes(1);

    resolvePromise({ id: 'msg_1', message: 'Success', submittedAt: new Date().toISOString() });
    await waitFor(() => {
      expect(screen.getByText(/thank you! your message has been sent successfully/i)).toBeInTheDocument();
    });
  });
});
