import { NextResponse, type NextRequest } from 'next/server';
import { applyMiddleware } from '@/app/middleware/middleware-chain';
// import { authMiddleware } from '@/app/middleware/auth';
import { loggingMiddleware } from '@/app/middleware/logging';

// Define middleware chain
const middlewareChain = [loggingMiddleware];

export async function middleware(req: NextRequest) {
  return applyMiddleware(req, middlewareChain);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
