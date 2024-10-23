import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/csrf';
import { getOrCreateRegistration } from '@/lib/supabase-client';
import { SessionData } from '@/lib/types/session';
import { ExtendedPartialServerStoreData } from '@/lib/types/types';

const SESSION_COOKIE_NAME = 'onboarding_session';
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

export async function GET(request: NextRequest) {
  console.log('GET request received for /api/session');

  try {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    console.log('Session cookie:', sessionCookie ? 'Present' : 'Missing');

    if (!sessionCookie) {
      return NextResponse.json({ session: null });
    }

    try {
      const sessionData = JSON.parse(sessionCookie) as SessionData;
      console.log('Session data parsed successfully');
      return NextResponse.json({ session: sessionData });
    } catch (error) {
      console.error('Error parsing session cookie:', error);
      return NextResponse.json({ session: null });
    }
  } catch (error) {
    console.error('Error in session GET:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST request received for /api/session');

  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token');
    console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');

    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token missing' }, { status: 403 });
    }

    const isValidCSRF = await validateCSRFToken(csrfToken);
    if (!isValidCSRF) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { email, formData } = body as {
      email: string;
      formData?: ExtendedPartialServerStoreData;
    };

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get or create registration
    const sessionData = await getOrCreateRegistration(email, formData);

    if (!sessionData) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Set session cookie
    cookies().set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    console.log('Session created successfully for email:', email);
    return NextResponse.json({
      success: true,
      session: sessionData,
    });
  } catch (error) {
    console.error('Error in session POST:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log('DELETE request received for /api/session');

  try {
    cookies().delete(SESSION_COOKIE_NAME);
    console.log('Session cookie deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in session DELETE:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
