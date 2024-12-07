'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { getOrCreateRegistration } from '@/lib/supabase-client';

interface FormState {
  name: string;
  email: string;
  password: string;
  showPassword: boolean;
  touched: {
    name: boolean;
    email: boolean;
    password: boolean;
  };
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

  useEffect(() => {
    const checkUser = async () => {
      console.log('Checking user:', user);
      if (user?.email) {
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('return_to');
        router.replace(returnTo || '/details');
        console.log('Redirecting to:', returnTo || '/details');
        console.log('User email:', user.email);
        router.refresh();
      }
    };
    checkUser();
  }, [user, router]);

  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    showPassword: false,
    touched: {
      name: false,
      email: false,
      password: false,
    },
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
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      touched: {
        ...prev.touched,
        [name]: true,
      },
    }));

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

  // Helper function to check if form is complete
  const isFormComplete = () => {
    return formState.name.trim() !== '' && formState.email.trim() !== '' && formState.password.trim() !== '';
  };

  // Helper function to check if we should show validation for a field
  const shouldShowValidation = (fieldName: keyof typeof formState.touched) => {
    return formState.touched[fieldName] && formState[fieldName].trim() !== '';
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
        error: 'Please fix the validation errors before continuing.',
        success: null,
      });
      return;
    }

    try {
      const response = await signUp({
        email: formState.email,
        password: formState.password,
        name: formState.name,
      });

      if (response.code === 'user_already_exists') {
        router.push('/details');
        return;
      }

      setPageState({
        isSubmitting: false,
        error: null,
        success: 'Account created successfully!',
      });
    } catch (error) {
      setPageState({
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'An error occurred during signup',
        success: null,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[460px]">
        <h1 className="text-3xl leading-10 text-center font-normal mb-8">Create your Virnika account</h1>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm mb-2">
              First and last name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={`w-full h-12 px-4 rounded-lg bg-input-bg border 
                text-white placeholder:text-gray-400 focus:outline-none
                transition-colors duration-200 ${
                  shouldShowValidation('name') && !validation.name.isValid
                    ? 'border-red-500 focus:border-red-600'
                    : shouldShowValidation('name') && validation.name.isValid
                    ? 'border-green-500 focus:border-green-600'
                    : 'border-[#1F2937] focus:border-blue-600'
                }`}
              value={formState.name}
              onChange={handleInputChange}
            />
            {shouldShowValidation('name') && !validation.name.isValid && (
              <p className="mt-1 text-sm text-red-500">{validation.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-white text-sm mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`w-full h-12 px-4 rounded-lg bg-input-bg border 
                text-white placeholder:text-gray-400 focus:outline-none
                transition-colors duration-200 ${
                  shouldShowValidation('email') && !validation.email.isValid
                    ? 'border-red-500 focus:border-red-600'
                    : shouldShowValidation('email') && validation.email.isValid
                    ? 'border-green-500 focus:border-green-600'
                    : 'border-[#1F2937] focus:border-blue-600'
                }`}
              value={formState.email}
              onChange={handleInputChange}
            />
            {shouldShowValidation('email') && !validation.email.isValid && (
              <p className="mt-1 text-sm text-red-500">{validation.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-white text-sm mb-2">
              Password
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={formState.showPassword ? 'text' : 'password'}
                  className={`w-full h-12 px-4 pr-12 rounded-lg bg-input-bg border 
                    text-white placeholder:text-gray-400 focus:outline-none
                    transition-colors duration-200 ${
                      shouldShowValidation('password') && !validation.password.isValid
                        ? 'border-red-500 focus:border-red-600'
                        : shouldShowValidation('password') && validation.password.isValid
                        ? 'border-green-500 focus:border-green-600'
                        : 'border-[#1F2937] focus:border-blue-600'
                    }`}
                  value={formState.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white
                    transition-colors duration-200"
                >
                  {formState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formState.touched.password && formState.password && (
                <div className="space-y-2">
                  {!validation.password.isValid && <p className="text-sm text-red-500">{validation.password.message}</p>}
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Password requirements:</div>
                    <ul className="text-xs space-y-1">
                      <li className={validation.password.requirements.minLength ? 'text-green-500' : 'text-gray-400'}>
                        • At least {PASSWORD_REQUIREMENTS.minLength} characters
                      </li>
                      <li className={validation.password.requirements.hasUppercase ? 'text-green-500' : 'text-gray-400'}>
                        • At least one uppercase letter
                      </li>
                      <li className={validation.password.requirements.hasLowercase ? 'text-green-500' : 'text-gray-400'}>
                        • At least one lowercase letter
                      </li>
                      <li className={validation.password.requirements.hasNumber ? 'text-green-500' : 'text-gray-400'}>
                        • At least one number
                      </li>
                      <li className={validation.password.requirements.hasSpecial ? 'text-green-500' : 'text-gray-400'}>
                        • At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              pageState.isSubmitting ||
              !isFormComplete() ||
              (formState.touched.name && !validation.name.isValid) ||
              (formState.touched.email && !validation.email.isValid) ||
              (formState.touched.password && !validation.password.isValid)
            }
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
              font-medium transition-colors duration-200 disabled:opacity-50 
              disabled:cursor-not-allowed"
          >
            {pageState.isSubmitting ? 'Creating account...' : 'Next'}
          </button>

          {/* TODO: Implement login link after login page is created */}
          {/* <div className="text-center space-x-1">
            <span className="text-gray-400">Already have an account?</span>
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
}
