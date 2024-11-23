# NextJS Auth Redirection Debugging Guide

## Problem Description

The app fails to redirect to `/details` page after successful authentication. This occurs even when a valid Supabase session exists.

## Required Changes

### 1. Page Component Updates (`page.tsx`)

```typescript
// Modify the useEffect for session checking
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

// Update the form submission handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPageState({ isSubmitting: true, error: null, success: null });

  // ... (keep existing validation)

  try {
    console.log('Attempting to sign up user:', formState.email);
    const { data, error } = await supabaseClient.auth.signUp({
      email: formState.email,
      password: formState.password,
      options: {
        data: {
          name: formState.name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    if (data.user) {
      // Create registration immediately after signup
      const registration = await getOrCreateRegistration(formState.email);

      if (registration) {
        router.push('/details');
      } else {
        throw new Error('Failed to create registration');
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    setPageState({
      isSubmitting: false,
      error: error instanceof Error ? error.message : 'An error occurred during registration',
      success: null,
    });
  }
};
```

### 2. Supabase Client Updates (`supabase-client.ts`)

```typescript
export async function getOrCreateRegistration(
  primary_email: string,
  initialData?: PartialServerStoreData
): Promise<AnonymousRegistration | null> {
  try {
    // Check for valid auth session before database operations
    const session = await supabaseClient.auth.getSession();
    if (!session.data.session) {
      console.error('No auth session found');
      return null;
    }

    // Try to fetch existing registration
    const { data, error: fetchError } = await supabaseClient
      .from('anonymous_registrations')
      .select()
      .eq('primary_email', primary_email)
      .single();

    // Handle case where registration doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new registration and return full record
      const { data: newReg, error: insertError } = await supabaseClient
        .from('anonymous_registrations')
        .insert({
          primary_email,
          registration_data: initialData,
        })
        .select() // Return the created record
        .single(); // Ensure single result

      if (insertError) throw insertError;
      return newReg;
    }

    // Re-throw any other errors for proper handling
    if (fetchError) throw fetchError;
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}
```

### 3. Middleware Configuration

Ensure your middleware structure matches this setup:

```typescript
// @/app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseAuthMiddleware } from '@/app/middleware/supabase-auth';
import { loggingMiddleware } from '@/app/middleware/logging';

export async function middleware(request: NextRequest) {
  // First apply logging middleware
  const loggingResponse = await loggingMiddleware(request);
  if (loggingResponse) return loggingResponse;

  // Then apply auth middleware and return its response
  const authResponse = await supabaseAuthMiddleware(request);
  return authResponse || NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
```

```typescript
// @/app/middleware/supabase-auth.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type { NextRequest } from 'next/server';

export async function supabaseAuthMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle auth for protected routes
  const protectedPaths = ['/details', '/pricing', '/subscribe'];
  const isProtectedRoute = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  const isAuthCallback = req.nextUrl.pathname.startsWith('/auth/callback');

  // Allow auth callback to proceed immediately
  if (isAuthCallback) {
    return res;
  }

  // Redirect if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Set session cookie
  const response = NextResponse.next();
  response.cookies.set({
    name: 'supabase-auth-token',
    value: session?.access_token || '',
    path: '/',
    secure: true,
    sameSite: 'lax',
  });

  return response;
}
```

### 4. Debug Steps

1. Add these console logs to track the auth flow:

```typescript
// In page.tsx useEffect
console.log('Auth state changed:', { user, session });

// In getOrCreateRegistration
console.log('Registration attempt:', { primary_email, session });

// In middleware
console.log('Middleware session:', session);
```

2. Check browser console for:

- Valid session object
- Registration creation success/failure
- Any error messages

3. Check Network tab for:

- Successful API calls to Supabase
- Proper auth headers
- Response status codes

4. Verify Database:

- Check `anonymous_registrations` table for records
- Verify RLS policies are not blocking access

### 5. Common Issues to Check

1. **Session State**

   - Is the session being properly set after auth?
   - Are cookies being properly set?
   - Is the session persisting across page loads?

2. **Database Access**

   - Are RLS policies correctly configured?
   - Does the user have proper permissions?
   - Are all required fields being populated?

3. **Routing**

   - Is the redirect happening too early?
   - Are there any circular redirects?
   - Is the auth callback handling complete before redirect?

4. **Error Handling**
   - Are errors being properly caught and logged?
   - Is error state preventing normal flow?
   - Are all async operations properly awaited?

### 6. Testing Steps

1. Complete registration flow with console open
2. Check all logged steps in sequence
3. Verify database records after registration
4. Test protected route access directly
5. Verify session persistence after refresh

### 7. Expected Behavior

1. User submits registration form
2. Account created in Supabase
3. Registration record created
4. Session established
5. Redirect to `/details` succeeds
6. Session persists across page loads
