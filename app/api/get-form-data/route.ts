import { NextResponse } from 'next/server';
import { getRegistrationData, type SessionData } from '@/lib/supabase-client';
import { GetFormDataResponse } from '@/lib/types/types';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  console.log('GET request received for /api/get-form-data');

  const csrfToken = request.headers.get('X-CSRF-Token');
  console.log('CSRF Token:', csrfToken ? 'Present: ' + csrfToken : 'Missing');

  // Get session data from cookie
  const sessionCookie = cookies().get('onboarding_session')?.value;
  let session: SessionData | null = null;

  try {
    session = sessionCookie ? (JSON.parse(sessionCookie) as SessionData) : null;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
  }

  console.log('Session found:', session ? 'Yes' : 'No');

  if (!session?.primary_email) {
    console.log('No valid session found');
    return NextResponse.json({
      formData: null,
      registrationId: null,
    } as GetFormDataResponse);
  }

  const formData = await getRegistrationData(session.primary_email);
  console.log('Form data found:', formData ? 'Yes' : 'No');

  if (!formData) {
    console.log('No form data found for email:', session.primary_email);
    return NextResponse.json({
      formData: null,
      registrationId: session.registrationId,
    } as GetFormDataResponse);
  }

  // Remove sensitive information
  const {
    number_forwarded_to_virnika,
    number_forwarded_to_restaurant,
    manager_email,
    twilio_number,
    phone_tree_extensions,
    banking_info,
    ...safeFormData
  } = formData;

  // Mask banking information
  const maskedBankingInfo = banking_info
    ? {
        routing_number:
          banking_info.routing_number.length > 4
            ? '*'.repeat(banking_info.routing_number.length - 4) + banking_info.routing_number.slice(-4)
            : banking_info.routing_number,
        account_number:
          banking_info.account_number.length > 4
            ? '*'.repeat(banking_info.account_number.length - 4) + banking_info.account_number.slice(-4)
            : banking_info.account_number,
      }
    : undefined;

  const responseData: GetFormDataResponse = {
    formData: {
      ...safeFormData,
      banking_info: maskedBankingInfo,
      primary_email: session.primary_email,
      registrationId: session.registrationId,
    },
    registrationId: session.registrationId,
  };

  console.log('Sending response with formData:', JSON.stringify(responseData));
  return NextResponse.json(responseData);
}
