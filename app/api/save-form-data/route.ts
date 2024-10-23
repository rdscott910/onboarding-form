import { NextRequest, NextResponse } from 'next/server';
import { updateRegistrationData, getOrCreateRegistration, type SessionData } from '@/lib/supabase-client';
import { ExtendedPartialServerStoreData } from '@/lib/types/types';
import { hasRequiredEmail } from '@/lib/types/types';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'onboarding_session';

export async function POST(request: NextRequest) {
  try {
    const formData: ExtendedPartialServerStoreData = await request.json();

    // Get current session
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)?.value;
    let session: SessionData | null = null;

    try {
      session = sessionCookie ? (JSON.parse(sessionCookie) as SessionData) : null;
    } catch (error) {
      console.error('Error parsing session cookie:', error);
    }

    // Validate email presence
    if (!hasRequiredEmail(formData)) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // If no session exists or email changed, create/get registration
    if (!session || session.primary_email !== formData.primary_email) {
      const newSession = await getOrCreateRegistration(formData.primary_email, formData);
      if (!newSession) {
        return NextResponse.json({ success: false, message: 'Failed to create registration' }, { status: 500 });
      }

      // Update session cookie
      cookies().set(SESSION_COOKIE_NAME, JSON.stringify(newSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      session = newSession;
    }

    // Update the registration data
    const success = await updateRegistrationData(formData.primary_email, formData);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Failed to update registration data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      registrationId: session.registrationId,
      primary_email: session.primary_email,
    });
  } catch (error) {
    console.error('Error in save-form-data:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}
