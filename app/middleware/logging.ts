import type { NextRequest } from 'next/server';

export async function loggingMiddleware(request: NextRequest) {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
}
