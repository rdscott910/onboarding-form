// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import serverStore from '@/lib/server-store';

// export async function GET() {
//   const submissionId = cookies().get('submissionId')?.value;

//   if (!submissionId) {
//     return NextResponse.json({ formData: null });
//   }

//   const formData = serverStore.get(submissionId);

//   if (!formData) {
//     return NextResponse.json({ formData: null });
//   }

//   return NextResponse.json({ formData });
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import serverStore from '@/lib/server-store';
import { PartialUserData } from '@/lib/types';

export async function GET() {
  const submissionId = cookies().get('submissionId')?.value;

  if (!submissionId) {
    return NextResponse.json({ error: 'No submission ID found' }, { status: 400 });
  }

  const userData: PartialUserData = serverStore.get(submissionId);

  if (!userData) {
    console.log('No user data found for submission ID:', submissionId);
    //return empty formData
    return NextResponse.json({ formData: null });
    // return NextResponse.json({ error: 'No user data found' }, { status: 404 });
  }

  // Remove sensitive information
  const {
    number_forwarded_to_virnika,
    number_forwarded_to_restaurant,
    manager_email,
    twilio_number,
    phone_tree_extensions,
    ...safeUserData
  } = userData;

  return NextResponse.json(safeUserData);
}
