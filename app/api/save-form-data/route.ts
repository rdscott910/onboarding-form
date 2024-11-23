import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { updateRegistrationData } from '@/lib/supabase-client';
import { PartialServerStoreData } from '@/lib/types/types';
import { hasRequiredEmail } from '@/lib/types/types';
import type { Database } from '@/lib/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData: PartialServerStoreData = await request.json();

    // Validate email presence
    if (!hasRequiredEmail(formData)) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Ensure the email matches the authenticated user
    if (formData.primary_email !== session.user.email) {
      return NextResponse.json({ success: false, message: 'Email mismatch' }, { status: 403 });
    }

    // Update the registration data
    const success = await updateRegistrationData(formData.primary_email, formData);
    if (!success) {
      return NextResponse.json({ success: false, message: 'Failed to update registration data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in save-form-data:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
