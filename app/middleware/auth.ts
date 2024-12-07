import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/types/supabase';

export async function authMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Skip auth check for callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return;
  }

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect routes that require authentication
  const protectedPaths = ['/details', '/pricing', '/subscribe'];
  if (protectedPaths.some((prefix) => req.nextUrl.pathname.startsWith(prefix))) {
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
}
