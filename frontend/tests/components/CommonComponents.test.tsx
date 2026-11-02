import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Input,
  TextArea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Alert,
  SectionHeader,
  LoadingSpinner,
} from '@/components/common';

describe('Shared Design System Components (components/common)', () => {
  describe('Button', () => {
    it('renders with different variants and handles clicks', () => {
      const handleClick = jest.fn();
      render(
        <>
          <Button variant="primary" onClick={handleClick}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </>
      );

      const primaryBtn = screen.getByRole('button', { name: 'Primary' });
      fireEvent.click(primaryBtn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows LoadingSpinner and disables button when isLoading is true', () => {
      render(<Button isLoading>Save Changes</Button>);

      const btn = screen.getByRole('button', { name: /save changes/i });
      expect(btn).toBeDisabled();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders left and right icons when provided', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">←</span>}
          rightIcon={<span data-testid="right-icon">→</span>}
        >
          Navigate
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Input', () => {
    it('renders label, input, and helper text', () => {
      render(
        <Input
          label="Username"
          helperText="Choose a unique handle"
          placeholder="e.g. jdoe"
        />
      );

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByText('Choose a unique handle')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. jdoe')).toBeInTheDocument();
    });

    it('renders inline error message with role="alert"', () => {
      render(<Input label="Email" error="Invalid email address" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Invalid email address');
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('TextArea', () => {
    it('renders textarea and character counter', () => {
      render(
        <TextArea
          label="Bio"
          value="Hello World"
          maxLength={100}
          showCount
          onChange={() => {}}
        />
      );

      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
      expect(screen.getByText('11 / 100')).toBeInTheDocument();
    });

    it('renders error message when error prop is passed', () => {
      render(<TextArea label="Description" error="Description is required" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Description is required');
    });
  });

  describe('Card', () => {
    it('renders Card with Header, Title, Description, Content, and Footer', () => {
      render(
        <Card hoverEffect>
          <CardHeader>
            <CardTitle>Architecture Overview</CardTitle>
            <CardDescription>System design principles</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content body text goes here.</p>
          </CardContent>
          <CardFooter>
            <span>Footer text</span>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Architecture Overview')).toBeInTheDocument();
      expect(screen.getByText('System design principles')).toBeInTheDocument();
      expect(screen.getByText('Content body text goes here.')).toBeInTheDocument();
      expect(screen.getByText('Footer text')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('renders badges in various semantic variants', () => {
      render(
        <>
          <Badge variant="primary">TypeScript</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Deprecated</Badge>
          <Badge variant="neutral">General</Badge>
        </>
      );

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Deprecated')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  describe('Alert', () => {
    it('renders alert message and triggers onClose callback', () => {
      const handleClose = jest.fn();
      render(
        <Alert
          variant="success"
          title="Operation Succeeded"
          message="Your profile has been updated."
          onClose={handleClose}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Operation Succeeded')).toBeInTheDocument();
      expect(screen.getByText('Your profile has been updated.')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close alert/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('SectionHeader', () => {
    it('renders title, subtitle, and badge with center alignment', () => {
      render(
        <SectionHeader
          title="Case Studies"
          subtitle="Explore recent production deployments."
          badge="Featured"
          align="center"
        />
      );

      expect(screen.getByText('Case Studies')).toBeInTheDocument();
      expect(screen.getByText('Explore recent production deployments.')).toBeInTheDocument();
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner', () => {
    it('renders with accessible role="status"', () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
