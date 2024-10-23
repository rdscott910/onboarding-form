'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCsrfToken } from '@/lib/csrfToken';
import { PartialLocationData } from '@/lib/types/types';

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

export default function PricingPage() {
  const [formData, setFormData] = useState<PartialLocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const csrfToken = await getCsrfToken();
        console.log('CSRF Token:', csrfToken);

        const response = await fetch('/api/get-form-data', {
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        });
        console.log('Response status: ', response.status);

        const data = await response.json();
        console.log('Received data: ', data);

        if (response.ok) {
          if (data.formData) {
            console.log('Setting form data:', data.formData);
            setFormData(data.formData);
          } else {
            console.log('Form data is null in the response');
            setError('No form data found. Please complete the previous steps first.');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch form data');
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred while loading form data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => router.push('/details')}
          >
            Go back to details page
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Data Found</h2>
          <p>We couldn't find your previous details. Please go back and fill them in.</p>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => router.push('/details')}
          >
            Go to details page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Pick your plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} formData={formData} />
        ))}
      </div>
    </div>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  formData: any;
}

function PricingCard({ plan, formData }: PricingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChoosePlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          ...formData,
          selectedPlan: plan.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          router.push('/subscribe');
        } else {
          throw new Error(data.message || 'Failed to save plan selection');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save plan selection');
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
      <button
        onClick={handleChoosePlan}
        disabled={isLoading}
        className={`bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Processing...' : 'Choose Plan'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
