# Direct Authentication Implementation Guide

## Overview

Implement direct authentication flow where users can create an account and be immediately redirected to `/details` without email verification.

## Required Changes

### 1. Page Component (`page.tsx`) Changes

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setPageState({ isSubmitting: true, error: null, success: null });

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

    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error('Signup failed - no user returned');

    // 2. Immediately sign in the user
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: formState.email,
      password: formState.password,
    });

    if (signInError) throw signInError;
    if (!signInData.user) throw new Error('Sign in failed - no user returned');

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
```

### 2. Supabase Project Settings

1. Go to Supabase Dashboard
2. Navigate to Authentication > Email Templates
3. Disable "Confirm signup" email template
4. In Auth Settings, set:
   ```
   Enable email confirmations: false
   Enable email signups: true
   ```

### 3. Update Supabase Client Config (`supabase-client.ts`)

```typescript
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable URL detection since we're not using redirects
  },
});

export async function getOrCreateRegistration(
  primary_email: string,
  initialData?: PartialServerStoreData
): Promise<AnonymousRegistration | null> {
  try {
    // Check for existing registration
    const { data: existing, error: fetchError } = await supabaseClient
      .from('anonymous_registrations')
      .select()
      .eq('primary_email', primary_email)
      .single();

    if (existing) return existing;

    // Create new registration if none exists
    const { data: newReg, error: insertError } = await supabaseClient
      .from('anonymous_registrations')
      .insert({
        primary_email,
        registration_data: {
          ...(initialData || {}),
          primary_email,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create registration:', insertError);
      return null;
    }

    return newReg;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}
```

### 4. Update Auth Provider (`AuthProvider.tsx`)

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current auth state
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
```

### 5. Update Middleware (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes logic
  const protectedPaths = ['/details', '/pricing', '/subscribe'];
  if (protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return res;
}
```

### Testing Steps

1. Attempt account creation:

```typescript
const testSignup = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};
```

2. Verify in Supabase dashboard:

- Auth > Users (should show user without email verification)
- Database > anonymous_registrations (should have record)

3. Check localStorage for:

- supabase.auth.token
- session persistence

4. Monitor Network tab for:

- POST /auth/v1/signup
- POST /auth/v1/token
- GET /rest/v1/anonymous_registrations

### Expected Flow

1. User submits signup form
2. Account created (no email verification)
3. Immediate sign in
4. Registration record created
5. Redirect to /details
6. Session persists across page reloads

### Common Issues

1. Session not persisting:

   - Check localStorage
   - Verify auth subscription
   - Check cookie settings

2. Registration failures:

   - Check RLS policies
   - Verify database permissions
   - Monitor network requests

3. Redirect issues:
   - Ensure auth state is set before redirect
   - Check protected route logic
   - Verify router push timing

Let me know if you need any clarification or run into specific issues!
