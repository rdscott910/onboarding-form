'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabaseClient } from '@/lib/supabase-client';
import { getOrCreateRegistration } from '@/lib/supabase-client';

interface FormState {
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
}

interface ValidationState {
  name: {
    isValid: boolean;
    message: string;
  };
  email: {
    isValid: boolean;
    message: string;
  };
  password: {
    isValid: boolean;
    message: string;
    strength: PasswordStrength;
    requirements: {
      minLength: boolean;
      hasUppercase: boolean;
      hasLowercase: boolean;
      hasNumber: boolean;
      hasSpecial: boolean;
    };
  };
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

interface PageState {
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESTRICTED_DOMAINS = ['example.com', 'test.com'];

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  patterns: {
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
  },
};

export default function CreateAccount() {
  const router = useRouter();
  const { user, signUp } = useAuth();

  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    showPassword: false,
  });

  const [pageState, setPageState] = useState<PageState>({
    isSubmitting: false,
    error: null,
    success: null,
  });

  const [validation, setValidation] = useState<ValidationState>({
    name: {
      isValid: true,
      message: '',
    },
    email: {
      isValid: true,
      message: '',
    },
    password: {
      isValid: true,
      message: '',
      strength: 'weak',
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
      },
    },
  });

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();

        if (session?.user?.email) {
          console.log('Session found, checking registration');
          const registration = await getOrCreateRegistration(session.user.email);

          if (registration) {
            console.log('Registration found, redirecting to details');
            router.push('/details');
          } else {
            console.log('No registration found for user');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    checkSession();
  }, [user, router]);

  const validateName = (name: string) => {
    if (!name.trim()) {
      return {
        isValid: false,
        message: 'Name is required',
      };
    }
    if (name.length < 2) {
      return {
        isValid: false,
        message: 'Name must be at least 2 characters long',
      };
    }
    return {
      isValid: true,
      message: '',
    };
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return {
        isValid: false,
        message: 'Email is required',
      };
    }
    if (!EMAIL_REGEX.test(email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address',
      };
    }
    const domain = email.split('@')[1];
    if (RESTRICTED_DOMAINS.includes(domain)) {
      return {
        isValid: false,
        message: 'This email domain is not allowed',
      };
    }
    return {
      isValid: true,
      message: '',
    };
  };

  const validatePassword = (password: string) => {
    const requirements = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.patterns.hasUppercase.test(password),
      hasLowercase: PASSWORD_REQUIREMENTS.patterns.hasLowercase.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.patterns.hasNumber.test(password),
      hasSpecial: PASSWORD_REQUIREMENTS.patterns.hasSpecial.test(password),
    };

    const passedRequirements = Object.values(requirements).filter(Boolean).length;
    let strength: PasswordStrength = 'weak';
    let isValid = false;
    let message = '';

    if (passedRequirements <= 2) {
      strength = 'weak';
      message = 'Password is too weak';
    } else if (passedRequirements === 3) {
      strength = 'medium';
      isValid = true;
    } else if (passedRequirements === 4) {
      strength = 'strong';
      isValid = true;
    } else {
      strength = 'very-strong';
      isValid = true;
    }

    return {
      isValid,
      message,
      strength,
      requirements,
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // Validate field
    let fieldValidation;
    switch (name) {
      case 'name':
        fieldValidation = validateName(value);
        break;
      case 'email':
        fieldValidation = validateEmail(value);
        break;
      case 'password':
        fieldValidation = validatePassword(value);
        break;
      default:
        return;
    }

    setValidation((prev) => ({
      ...prev,
      [name]: fieldValidation,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageState({ isSubmitting: true, error: null, success: null });

    // Validate all fields
    const nameValidation = validateName(formState.name);
    const emailValidation = validateEmail(formState.email);
    const passwordValidation = validatePassword(formState.password);

    setValidation({
      name: nameValidation,
      email: emailValidation,
      password: passwordValidation,
    });

    if (!nameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
      setPageState({
        isSubmitting: false,
        error: 'Please fix the errors in the form',
        success: null,
      });
      return;
    }

    try {
      console.log('Starting signup process:', formState.email);

      // 1. Sign up the user with auto-confirm enabled
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            name: formState.name,
          },
          // Don't wait for email verification
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setPageState({
            isSubmitting: false,
            error: 'User already registered, Signing in instead',
            success: null,
          });
          // 2. Immediately sign in the user
          const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: formState.email,
            password: formState.password,
          });
          if (signInError) throw signInError;
          if (!signInData.user) throw new Error('Sign in failed - please check your email and password');

          // If sign in successful, continue with registration check
          const registration = await getOrCreateRegistration(formState.email);
          if (!registration) throw new Error('Failed to create registration record');

          // Redirect to details page
          router.push('/details');
          return; // Add return to prevent executing the code below
        }
        // Handle other signup errors
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Signup failed - no user returned');
      }

      // 3. Create or get registration record
      const registration = await getOrCreateRegistration(formState.email);
      if (!registration) throw new Error('Failed to create registration record');

      // 4. Redirect to details page
      console.log('Auth success, redirecting to details');
      router.push('/details');
    } catch (error) {
      console.error('Auth error:', error);
      setPageState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred during registration',
        success: null,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex flex-col justify-center min-h-screen py-12 max-w-md mx-auto">
        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Create your account</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formState.name}
                  onChange={handleInputChange}
                />
                {!validation.name.isValid && <p className="mt-2 text-sm text-red-600">{validation.name.message}</p>}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formState.email}
                  onChange={handleInputChange}
                />
                {!validation.email.isValid && <p className="mt-2 text-sm text-red-600">{validation.email.message}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formState.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  >
                    {formState.showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {!validation.password.isValid && <p className="mt-2 text-sm text-red-600">{validation.password.message}</p>}
                <div className="mt-2">
                  <div className="text-sm text-gray-600">Password strength:</div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${
                        validation.password.strength === 'weak'
                          ? 'w-1/4 bg-red-500'
                          : validation.password.strength === 'medium'
                          ? 'w-2/4 bg-yellow-500'
                          : validation.password.strength === 'strong'
                          ? 'w-3/4 bg-green-500'
                          : 'w-full bg-green-600'
                      }`}
                    />
                  </div>
                  <ul className="mt-2 text-sm text-gray-600 space-y-1">
                    <li className={validation.password.requirements.minLength ? 'text-green-600' : ''}>At least 8 characters</li>
                    <li className={validation.password.requirements.hasUppercase ? 'text-green-600' : ''}>One uppercase letter</li>
                    <li className={validation.password.requirements.hasLowercase ? 'text-green-600' : ''}>One lowercase letter</li>
                    <li className={validation.password.requirements.hasNumber ? 'text-green-600' : ''}>One number</li>
                    <li className={validation.password.requirements.hasSpecial ? 'text-green-600' : ''}>One special character</li>
                  </ul>
                </div>
              </div>

              {pageState.error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{pageState.error}</div>
                </div>
              )}

              {pageState.success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{pageState.success}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={pageState.isSubmitting}
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    pageState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {pageState.isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
