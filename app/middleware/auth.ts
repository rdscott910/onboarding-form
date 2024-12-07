// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import type { Database } from '@/lib/types/supabase';

// export async function authMiddleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient<Database>({ req, res });

//   // Skip auth check for public routes
//   const publicRoutes = ['/', '/auth/callback'];
//   if (publicRoutes.includes(req.nextUrl.pathname)) {
//     return res;
//   }

//   try {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     console.log('Session:', session);

//     // Protected routes that require authentication
//     const protectedPaths = ['/details', '/pricing', '/subscribe', '/success'];
//     const isProtectedRoute = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

//     if (isProtectedRoute && !session) {
//       // Redirect to home page with return_to parameter
//       const redirectUrl = new URL('/', req.url);
//       console.log('Redirecting to:', redirectUrl.toString());
//       return NextResponse.redirect(redirectUrl);
//     }

//     return res;
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     console.log('Redirecting to:', new URL('/?error=server_error', req.url).toString());
//     return NextResponse.redirect(new URL('/?error=server_error', req.url));
//   }
// }

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };
