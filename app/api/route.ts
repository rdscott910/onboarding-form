import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: 'price_1PxUjPBPCnt5sWlt2BhbpTfX',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
    });

    console.log('Session: ', session);

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null,
    });
  } catch (error) {
    console.error('Error in root API route:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
