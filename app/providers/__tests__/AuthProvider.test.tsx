import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthProvider';

// Mock Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn((callback) => {
        // Store callback for triggering auth state changes in tests
        (global as any).authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    },
  })),
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <>
          <div>Logged in as {user.email}</div>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <>
          <button onClick={() => signIn({ email: 'test@example.com', password: 'password' })}>
            Sign In
          </button>
          <button onClick={() => signUp({ email: 'test@example.com', password: 'password' })}>
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle successful sign in', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null,
    });

    jest.spyOn(require('@/lib/supabase-client'), 'createClient').mockImplementation(() => ({
      auth: {
        signInWithPassword: mockSignIn,
        onAuthStateChange: jest.fn(),
      },
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('should handle sign in error', async () => {
    const mockError = { message: 'Invalid credentials' };
    const mockSignIn = jest.fn().mockResolvedValue({ data: null, error: mockError });

    jest.spyOn(require('@/lib/supabase-client'), 'createClient').mockImplementation(() => ({
      auth: {
        signInWithPassword: mockSignIn,
        onAuthStateChange: jest.fn(),
      },
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('should handle sign out', async () => {
    const mockSignOut = jest.fn().mockResolvedValue({ error: null });

    jest.spyOn(require('@/lib/supabase-client'), 'createClient').mockImplementation(() => ({
      auth: {
        signOut: mockSignOut,
        onAuthStateChange: jest.fn(),
      },
    }));

    // Simulate logged in state
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger auth state change to simulate logged in user
    await act(async () => {
      (global as any).authStateCallback('SIGNED_IN', {
        user: { email: 'test@example.com' },
      });
    });

    const signOutButton = screen.getByText('Sign Out');
    await userEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should update user state on auth state change', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate auth state change
    await act(async () => {
      (global as any).authStateCallback('SIGNED_IN', {
        user: { email: 'test@example.com' },
      });
    });

    expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument();

    // Simulate sign out
    await act(async () => {
      (global as any).authStateCallback('SIGNED_OUT', null);
    });

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
