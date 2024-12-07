import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOrCreateRegistration } from '@/lib/supabase-client';
import type { Database } from '@/lib/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json({ success: false, message: 'No email associated with session' }, { status: 400 });
    }

    // Get the registration data
    const data = await getOrCreateRegistration(email);
    if (!data) {
      return NextResponse.json({ success: false, message: 'No data found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        primary_email: email,
      },
    });
  } catch (error) {
    console.error('Error in get-form-data:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
