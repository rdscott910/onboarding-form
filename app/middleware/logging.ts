import { NextRequest, NextResponse } from 'next/server';

export async function loggingMiddleware(req: NextRequest) {
  console.log(`Request made to: ${req.url}`);
  return NextResponse.next();
}
