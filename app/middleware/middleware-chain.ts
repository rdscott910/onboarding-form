import { NextResponse, type NextRequest } from 'next/server';

export type MiddlewareFunction = (req: NextRequest, res?: NextResponse) => Promise<NextResponse | undefined | void>;

export async function applyMiddleware(req: NextRequest, middlewares: MiddlewareFunction[]): Promise<NextResponse> {
  let response = NextResponse.next();

  for (const middleware of middlewares) {
    try {
      const result = await middleware(req, response);
      if (result instanceof NextResponse) {
        response = result;
        // If middleware returns a response, stop the chain
        break;
      }
    } catch (error) {
      console.error(`Middleware error:`, error);
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return response;
}
