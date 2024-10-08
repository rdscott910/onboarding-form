'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import serverStore from '@/lib/server-store';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { PartialUserData } from '@/lib/types';

// Simple in-memory rate limiting
const rateLimitStore = new Map<string, { count: number; lastReset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneMinuteWindow = 60 * 1000; // 1 minute
  const max = 5; // 5 requests per minute

  let bucket = rateLimitStore.get(ip);
  if (!bucket) {
    bucket = { count: 0, lastReset: now };
    rateLimitStore.set(ip, bucket);
  }

  if (now - bucket.lastReset > oneMinuteWindow) {
    bucket.count = 0;
    bucket.lastReset = now;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count++;
  return true;
}

export async function submitRootForm(formData: FormData) {
  const ip = headers().get('x-forwarded-for') ?? '127.0.0.1';
  if (!checkRateLimit(ip)) {
    throw new Error('Too many requests');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // Validate input
    if (!name || !email || !password) {
      throw new Error('Missing required fields');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique ID for this submission
    let submissionId = cookies().get('submissionId')?.value;

    if (!submissionId) {
      submissionId = uuidv4();
    }

    const userData: PartialUserData = { name, contact_email: email, created_at: new Date().toISOString() };

    // Store the data temporarily
    serverStore.set(submissionId, userData, 300); // Expires in 5 minutes

    // Set a secure, HTTP-only cookie with the submission ID
    const response = NextResponse.json({ success: true });
    response.cookies.set('submissionId', submissionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 5, // 5 minutes expiration
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in form submission:', error);
    throw new Error('An error occurred while processing your request');
  }
}
