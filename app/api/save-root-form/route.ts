import { NextRequest, NextResponse } from 'next/server';
import { submitRootForm } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await submitRootForm(formData);

    return response;
  } catch (error) {
    console.error('Error in /api/save-root-form:', error);

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}
