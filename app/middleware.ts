import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { loggingMiddleware } from '@/app/middleware/logging';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client for auth
  const supabase = createMiddlewareClient({ req, res });

  // Apply logging middleware
  const loggingResponse = await loggingMiddleware(req);
  if (loggingResponse) return loggingResponse;

  // Skip auth check for callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res;
  }

  // Refresh session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect routes that require authentication
  const protectedPaths = ['/details', '/pricing', '/subscribe'];
  const path = req.nextUrl.pathname;

  if (protectedPaths.some((prefix) => path.startsWith(prefix))) {
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
