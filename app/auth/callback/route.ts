import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/lib/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/details';

  if (!code) {
    console.error('No code provided to callback');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL('/?error=unexpected', request.url));
  }
}
