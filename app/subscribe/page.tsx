'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckIcon, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { PartialServerStoreData } from '@/lib/types/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabaseClient } from '@/lib/supabase-client';
import { getRegistrationData } from '@/lib/supabase-client';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error('Stripe publishable key is not defined');
  throw new Error('Stripe publishable key is not defined');
}
const stripePromise = loadStripe(stripeKey);

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  description: string;
  features: PlanFeature[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'smart',
    title: 'Smart Plan',
    price: 'FREE',
    description: 'Great for solution to get started with voice AI.',
    features: [
      { name: 'Smart IVR/Phone tree', included: true },
      { name: 'Beautiful custom greeting', included: true },
      { name: 'Receive one call at a time', included: true },
      { name: 'Languages: English only', included: true },
      { name: 'Pick your AI voice from 3 options', included: true },
      { name: 'Answers basic questions', included: true },
      { name: 'Removes those pesky sales calls', included: true },
    ],
  },
  {
    id: 'wise',
    title: 'Wise Plan',
    price: '$9.99/mo',
    description: 'Great for fielding customer calls and reducing labor overhead during peak hours. The best solution for most restaurants.',
    features: [
      { name: 'All the features from the Smart Plan', included: true },
      { name: 'Beautiful custom greeting', included: true },
      { name: 'Forward voice messages to email', included: true },
      { name: 'Sends text of your app or website', included: true },
      { name: 'Receive two calls simultaneously', included: true },
      { name: 'Choose which type of calls to forward', included: true },
      { name: 'Make use of current phone tree IVR', included: true },
      { name: 'Support in Spanish and English', included: true },
      { name: 'Night Mode - works after closing hours', included: true },
      { name: 'Email support', included: true },
      { name: 'Accept to-go order (coming soon)', included: true },
      { name: 'POS integration', included: true },
    ],
  },
  {
    id: 'genius',
    title: 'Genius Plan',
    price: '$299/mo',
    description: 'Great for restaurants that are scaling. Get all the great features in the Smart plan plus the following',
    features: [
      { name: 'All the features from the Wise Plan', included: true },
      { name: 'Dedicated Founder level support', included: true },
      { name: 'Custom upselling functionality', included: true },
      { name: '10 calls per restaurant simultaneously', included: true },
      { name: 'Accept reservations', included: true },
      { name: 'Clone a specific voice', included: true },
      { name: 'Accept delivery orders', included: true },
    ],
  },
];

interface PageState {
  isLoading: boolean;
  error: string | null;
  formData: PartialServerStoreData | null;
  clientSecret: string | null;
}

function Subscribe() {
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    formData: null,
    clientSecret: null,
  });

  useEffect(() => {
    const fetchFormData = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session?.user.email) {
        setState((prev) => ({
          ...prev,
          error: 'Authentication required',
          isLoading: false,
        }));
        return;
      }

      try {
        const data = await getRegistrationData(session.user.email);
        if (data) {
          setState((prev) => ({
            ...prev,
            formData: data,
            isLoading: false,
          }));

          // If it's a paid plan, create a Stripe checkout session
          if (data.selectedPlan !== 'smart') {
            const stripeResponse = await fetch('/api/stripe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                priceId: data.selectedPlan,
                email: session.user.email,
              }),
            });

            if (!stripeResponse.ok) {
              throw new Error('Failed to create checkout session');
            }

            const stripeData = await stripeResponse.json();
            setState((prev) => ({
              ...prev,
              clientSecret: stripeData.clientSecret,
            }));
          }
        } else {
          setState((prev) => ({
            ...prev,
            error: 'No form data found. Please complete the previous steps first.',
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          isLoading: false,
        }));
      }
    };

    fetchFormData();
  }, [supabaseClient]);

  if (state.isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p>Please sign in to access subscription details.</p>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{state.error}</p>
          <Button className="mt-4" onClick={() => router.push('/pricing')}>
            Go back to pricing
          </Button>
        </div>
      </div>
    );
  }

  if (!state.formData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Plan Selected</h2>
          <p>Please select a plan first.</p>
          <Button className="mt-4" onClick={() => router.push('/pricing')}>
            Go to pricing
          </Button>
        </div>
      </div>
    );
  }

  // For free plan
  if (state.formData.selectedPlan === 'smart') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Smart Plan!</h1>
          <p className="text-xl mb-8">You&apos;ve successfully signed up for our free plan.</p>
          <Button onClick={() => router.push('/success')}>Continue to Dashboard</Button>
        </div>
      </div>
    );
  }

  const selectedPlan = pricingPlans.find((plan) => plan.id === state.formData?.selectedPlan) || pricingPlans[0];

  // For paid plans
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Subscription Details</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plan Summary Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">
            {selectedPlan.title} <span className="text-cyan-400">{selectedPlan.price}</span>
          </h2>
          <p className="text-gray-400 mb-6">{selectedPlan.description}</p>
          <h3 className="font-semibold mb-4">Includes:</h3>
          <ul className="space-y-2 mb-8">
            {selectedPlan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-5 w-5 text-cyan-400 mr-2 mt-0.5" />
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <Link href="/pricing">
            <Button variant="secondary" className="w-full">
              Change plan
            </Button>
          </Link>
        </div>

        {/* Checkout Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          {state.clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: state.clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-4">Processing payment details...</p>
            </div>
          )}
        </div>
      </div>

      {/* Plan Requirements Section */}
      {(selectedPlan.id === 'genius' || selectedPlan.id === 'wise') && (
        <div className="max-w-6xl mx-auto mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">{selectedPlan.title} Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>
                  Update your Google Places with Virnika&apos;s number. (You don&apos;t need to change or forward your current number)
                </li>
                <li>Receiving weekly deposits for your revenue from call in orders on every Tuesday & Friday.</li>
                <li>Agreeing for Virnika to charge a service fee of a $1.00 to customers for to-go orders.</li>
                <li>Credit Card processing for to-go orders is 2.9% and 30 cents</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Subscribe />
    </Suspense>
  );
}

export default SubscribePage;
