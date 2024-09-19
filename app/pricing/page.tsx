import React from 'react';
import Link from 'next/link';
import { CheckIcon } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-12">Pick your plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
}

function PricingCard({ plan }: PricingCardProps) {
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
      <Link
        href={{
          pathname: '/subscribe',
          query: { plan: plan.id },
        }}
      >
        <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Choose Plan</button>
      </Link>
    </div>
  );
}
