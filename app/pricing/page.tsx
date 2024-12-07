'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PartialServerStoreData } from '@/lib/types/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/providers/AuthProvider';
import { getRegistrationData } from '@/lib/supabase-client';

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

interface PageState {
  isLoading: boolean;
  error: string | null;
  formData: PartialServerStoreData | null;
}

const PRICING_PLANS: PricingPlan[] = [
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

export default function PricingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    formData: null,
  });

  useEffect(() => {
    const fetchFormData = async () => {
      if (!user?.email) {
        setState((prev) => ({
          ...prev,
          error: 'Authentication required',
          isLoading: false,
        }));
        return;
      }

      try {
        const data = await getRegistrationData(user.email);
        if (data) {
          setState((prev) => ({
            ...prev,
            formData: data,
            isLoading: false,
          }));
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

    if (!authLoading) {
      fetchFormData();
    }
  }, [authLoading, user]);

  if (authLoading || state.isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-300">{state.error}</p>
          </div>
          <Button onClick={() => router.push('/details')}>Go Back to Details</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 text-center">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} formData={state.formData || {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  formData: PartialServerStoreData;
}

function PricingCard({ plan, formData }: PricingCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChoosePlan = async () => {
    if (!user?.email) {
      setError('Your session has expired. Please sign in again.');
      router.push('/');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          selectedPlan: plan.id,
          primary_email: user.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save plan selection');
      }

      if (data.success) {
        router.push('/subscribe');
      } else {
        throw new Error(data.message || 'Failed to save plan selection');
      }
    } catch (error) {
      console.error('Error saving plan selection:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-8 flex flex-col">
      <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
      <p className="text-3xl font-bold mb-4">{plan.price}</p>
      <p className="text-gray-400 mb-6">{plan.description}</p>
      <h3 className="font-semibold mb-4">Includes:</h3>
      <ul className="space-y-2 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
            <span>{feature.name}</span>
          </li>
        ))}
      </ul>
      <Button onClick={handleChoosePlan} disabled={isLoading} className={isLoading ? 'opacity-50' : ''}>
        {isLoading ? 'Processing...' : 'Choose Plan'}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
