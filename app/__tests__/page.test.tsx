import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '../page';
import { AuthProvider } from '../providers/AuthProvider';

// Mock the Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  })),
}));

describe('Main Page', () => {
  const renderPage = () => {
    return render(
      <AuthProvider>
        <Page />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Email Validation', () => {
    it('should validate email format', async () => {
      renderPage();
      const emailInput = screen.getByLabelText(/email/i);

      // Test invalid email
      await userEvent.type(emailInput, 'invalid-email');
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();

      // Test valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@example.com');
      expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
    });

    it('should check for restricted domains', async () => {
      renderPage();
      const emailInput = screen.getByLabelText(/email/i);

      // Test restricted domain
      await userEvent.type(emailInput, 'test@gmail.com');
      expect(screen.getByText(/please use your work email/i)).toBeInTheDocument();

      // Test allowed domain
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'test@company.com');
      expect(screen.queryByText(/please use your work email/i)).not.toBeInTheDocument();
    });
  });

  describe('Password Validation', () => {
    it('should validate password requirements', async () => {
      renderPage();
      const passwordInput = screen.getByLabelText(/password/i);

      // Test weak password
      await userEvent.type(passwordInput, 'weak');
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();

      // Test strong password
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'StrongP@ss123');
      expect(screen.queryByText(/at least 8 characters/i)).not.toBeInTheDocument();
    });

    it('should show password strength indicator', async () => {
      renderPage();
      const passwordInput = screen.getByLabelText(/password/i);

      // Test password strength progression
      await userEvent.type(passwordInput, 'weak');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'StrongP@ss123');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should handle successful sign up', async () => {
      const mockSignUp = jest.fn().mockResolvedValue({ error: null });
      jest.spyOn(require('@/lib/supabase-client'), 'createClient').mockImplementation(() => ({
        auth: {
          signUp: mockSignUp,
        },
      }));

      renderPage();
      
      // Fill in form
      await userEvent.type(screen.getByLabelText(/email/i), 'test@company.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'StrongP@ss123');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(submitButton);

      // Verify form submission
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@company.com',
          password: 'StrongP@ss123',
        });
      });
    });

    it('should handle sign up error', async () => {
      const mockError = { message: 'Sign up failed' };
      const mockSignUp = jest.fn().mockResolvedValue({ error: mockError });
      jest.spyOn(require('@/lib/supabase-client'), 'createClient').mockImplementation(() => ({
        auth: {
          signUp: mockSignUp,
        },
      }));

      renderPage();
      
      // Fill in form
      await userEvent.type(screen.getByLabelText(/email/i), 'test@company.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'StrongP@ss123');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      await userEvent.click(submitButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/sign up failed/i)).toBeInTheDocument();
      });
    });
  });
});
