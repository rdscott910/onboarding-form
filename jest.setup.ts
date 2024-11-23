// jest.setup.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { cleanup } from '@testing-library/react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    },
  }),
}));

// Add global mocks
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Add global beforeAll hook
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Add global afterAll hook
afterAll(() => {
  // Cleanup test environment
});
