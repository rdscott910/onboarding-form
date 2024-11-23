import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock NextRequest
class MockRequest implements Request {
  constructor(public url: string) {}
  // Implement other required properties and methods
  method = 'GET';
  headers = new Headers();
  clone() { return this; }
  // Add other required implementations
}

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

// Mock Supabase auth helpers
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn(),
}));

describe('Auth Middleware', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    (NextResponse.next as jest.Mock).mockImplementation(() => ({ headers: new Headers() }));
    (NextResponse.redirect as jest.Mock).mockImplementation((url) => ({ url }));
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
      },
    };
    (createMiddlewareClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('should allow access to public routes', async () => {
    const req = new MockRequest('http://localhost:3000/');
    await middleware({ url: req.url } as any);
    expect(mockSupabase.auth.getSession).not.toHaveBeenCalled();
  });

  it('should redirect to login for protected routes when not authenticated', async () => {
    const req = new MockRequest('http://localhost:3000/details');
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    await middleware({ url: req.url } as any);

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/');
  });

  it('should allow access to protected routes when authenticated', async () => {
    const req = new MockRequest('http://localhost:3000/details');
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { email: 'test@example.com' },
        },
      },
    });

    await middleware({ url: req.url } as any);

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should handle API routes correctly', async () => {
    const req = new MockRequest('http://localhost:3000/api/submit');
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { email: 'test@example.com' },
        },
      },
    });

    await middleware({ url: req.url } as any);

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should refresh auth session', async () => {
    const req = new MockRequest('http://localhost:3000/details');
    const mockSession = {
      data: {
        session: {
          user: { email: 'test@example.com' },
        },
      },
    };
    mockSupabase.auth.getSession.mockResolvedValue(mockSession);

    await middleware({ url: req.url } as any);

    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
