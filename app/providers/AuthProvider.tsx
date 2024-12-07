'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';
import type { AnonymousRegistration } from '@/lib/types/types';
import { getOrCreateRegistration } from '@/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  registration: AnonymousRegistration | null;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  registration: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [registration, setRegistration] = useState<AnonymousRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);

          if (session.user?.email) {
            const reg = await getOrCreateRegistration(session.user.email);
            setRegistration(reg);

            const params = new URLSearchParams(window.location.search);
            const returnTo = params.get('return_to');
            if (window.location.pathname === '/') {
              router.push(returnTo || '/details');
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error instanceof Error ? error.message : 'Failed to check session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.email) {
        const reg = await getOrCreateRegistration(session.user.email);
        setRegistration(reg);

        if (_event === 'SIGNED_IN') {
          const params = new URLSearchParams(window.location.search);
          const returnTo = params.get('return_to');
          console.log('Redirecting to:', returnTo || '/details');
          router.push(returnTo || '/details');
        }
      } else {
        setRegistration(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sign up with email and password
  const signUp = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
      console.log('Starting signup process:', email);
      setLoading(true);
      setError(null);

      // 1. Sign up the user with auto-confirm enabled
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // NOTE:Don't wait for email verification
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error('Signup failed - no user returned');

      // 2. Immediately sign in the user
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!signInData.user) throw new Error('Sign in failed - no user returned');

      // 3. Create or get registration record
      const registration = await getOrCreateRegistration(email);
      if (!registration) throw new Error('Failed to create registration record');
      setRegistration(registration);

      // 4. Redirect to details page
      console.log('Auth success, redirecting to details');
      router.push('/details');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data?.user?.email) {
        const reg = await getOrCreateRegistration(data.user.email);
        setRegistration(reg);
        router.push('/details');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    setRegistration(null);
    router.push('/');
  };

  const value = {
    user,
    session,
    registration,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
