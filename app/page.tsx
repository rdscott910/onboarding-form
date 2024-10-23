'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getCsrfToken } from '@/lib/csrfToken';
import { ExtendedPartialServerStoreData } from '@/lib/types/types';
import { SessionData } from '@/lib/types/session';

interface FormState {
  name: string;
  contact_email: string;
  password: string;
  showPassword: boolean;
}

interface PageState {
  isSubmitting: boolean;
  error: string | null;
  session: SessionData | null;
}

export default function CreateAccount() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    name: '',
    contact_email: '',
    password: '',
    showPassword: false,
  });

  const [pageState, setPageState] = useState<PageState>({
    isSubmitting: false,
    error: null,
    session: null,
  });

  // Check for existing session
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/get-form-data', {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.formData?.primary_email && data.registrationId) {
            // If valid session exists, redirect to details page
            router.push('/details');
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkExistingSession();
  }, [router]);

  const validateForm = (): string | null => {
    if (!formState.name.trim()) return 'Name is required';
    if (!formState.contact_email.trim()) return 'Email is required';
    if (!formState.password.trim()) return 'Password is required';
    if (formState.password.length < 8) return 'Password must be at least 8 characters';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setPageState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    setPageState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const csrfToken = await getCsrfToken();
      const formDataToSubmit: ExtendedPartialServerStoreData = {
        name: formState.name,
        contact_email: formState.contact_email,
        primary_email: formState.contact_email, // Set primary_email for session management
        hashedPassword: formState.password, // Will be hashed server-side
        request_type: 'submitRootForm',
      };

      const response = await fetch('/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify(formDataToSubmit),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Update session state with returned data
      if (data.primary_email && data.registrationId) {
        const sessionData: SessionData = {
          primary_email: data.primary_email,
          registrationId: data.registrationId,
        };

        setPageState((prev) => ({ ...prev, session: sessionData }));
      }

      router.push('/details');
    } catch (error) {
      console.error('Error creating account:', error);
      setPageState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    } finally {
      setPageState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center mt-20 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-white">Create your Virnika account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                First and last name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="First and last name"
                value={formState.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="contact_email" className="sr-only">
                Email address
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formState.contact_email}
                onChange={handleInputChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={formState.showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formState.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {formState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {pageState.error && <p className="text-red-500 text-sm text-center">{pageState.error}</p>}

          <div>
            <button
              type="submit"
              disabled={pageState.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageState.isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
