import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import serverStore from '@/lib/server-store';

export async function POST(request: NextRequest) {
  const formData = await request.json();
  const cookies = request.cookies;
  let submissionId = cookies.get('submissionId')?.value;
  console.log('Get cookie:', submissionId);

  if (!submissionId) {
    submissionId = uuidv4();
    console.log('New submission ID:', submissionId);

    // Set the cookie in the response
    const response = NextResponse.json({ success: true });
    response.cookies.set('submissionId', submissionId, { maxAge: 3600 * 24, path: '/' });
    console.log('Check cookie:', response.cookies.get('submissionId')?.value);

    // Store the data
    serverStore.set(submissionId, formData, 3600 * 24); // Store for 24 hours
    return response;
  } else {
    // append to existing data
    const existingData = serverStore.get(submissionId);
    console.log('Existing data:', existingData);
    const mergedData = { ...existingData, ...formData };
    console.log('Merged data:', mergedData);
    serverStore.set(submissionId, mergedData, 3600 * 24); // Store for 24 hours
    // serverStore.set(submissionId, formData, 3600 * 24); // Store for 24 hours
    return NextResponse.json({ success: true });
  }
}
