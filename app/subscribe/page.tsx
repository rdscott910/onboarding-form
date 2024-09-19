'use client';

import React, { useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckIcon, AlertTriangle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

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

const Subscribe = () => {
  const fetchClientSecret = useCallback(async () => {
    // Create a Checkout Session
    const res = await fetch('/api', {
      method: 'POST',
    });
    const data = await res.json();
    return data.clientSecret;
  }, []);

  const options = { fetchClientSecret };

  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get('plan') || 'smart';
  const selectedPlan = pricingPlans.find((plan) => plan.id === selectedPlanId) || pricingPlans[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Subscription Details</h1>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <button className="w-full bg-white text-gray-900 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">Change plan</button>
          </Link>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          {/* <h3 className="text-lg font-semibold mb-4">Card information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-400 mb-1">
                Card number
              </label>
              <input type="text" id="card-number" className="w-full bg-gray-700 rounded-md p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-400 mb-1">
                  MM / YY
                </label>
                <input type="text" id="expiry" className="w-full bg-gray-700 rounded-md p-2" />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-400 mb-1">
                  CVC
                </label>
                <input type="text" id="cvc" className="w-full bg-gray-700 rounded-md p-2" />
              </div>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-400 mb-1">
                Country or region
              </label>
              <select id="country" className="w-full bg-gray-700 rounded-md p-2">
                <option>United States</option>
              </select>
            </div>
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-400 mb-1">
                ZIP
              </label>
              <input type="text" id="zip" className="w-full bg-gray-700 rounded-md p-2" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-6 mb-4">Contact details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                First and last name
              </label>
              <input type="text" id="name" className="w-full bg-gray-700 rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">
                Phone number
              </label>
              <input type="tel" id="phone" className="w-full bg-gray-700 rounded-md p-2" />
            </div>
          </div>
          <Link href="success">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md mt-6 hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </Link> */}
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
      {selectedPlan.id === 'genius' ||
        (selectedPlan.id === 'wise' && (
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
        ))}
    </div>
  );
};

const SubscribePage = () => (
  <Suspense fallback="Loading...">
    <Subscribe />
  </Suspense>
);

export default SubscribePage;
