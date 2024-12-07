'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import HappyFace from '@/components/icons/happy-face';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Database } from '@/lib/types/supabase';

interface PageState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function CongratulationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [twilioNumber, setTwilioNumber] = useState<string | null>('123456789');
  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    success: false,
  });

  useEffect(() => {
    const verifySubscription = async () => {
      if (!user?.email) {
        setState((prev) => ({
          ...prev,
          error: 'Authentication required',
          isLoading: false,
        }));
        router.push('/');
        return;
      }

      try {
        // Verify subscription status
        const response = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to verify subscription');
        }

        setState((prev) => ({
          ...prev,
          success: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          isLoading: false,
        }));
      }
    };

    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });
    const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    const loadingTimer = setTimeout(() => setState((prev) => ({ ...prev, isLoading: false })), 5000); // Stop loading after 5 seconds
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    verifySubscription();

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [router, user]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <ReactConfetti width={dimensions.width} height={dimensions.height} />}
      <div className="text-center max-w-2xl z-10">
        <div className="mb-8">
          <HappyFace />
        </div>

        <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
        <p className="mb-8 text-gray-300">
          You have successfully hired Virnika, your first digital employee to help facilitate frontend customer interactions.
        </p>

        <div className="flex items-center justify-center text-yellow-400 mb-6">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p className="text-sm">We emailed you instructions on how to update your Google Places listing</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-400 mb-2">Your new customer facing phone number</p>
          {state.isLoading ? (
            <p className="text-3xl font-bold">Loading...</p>
          ) : state.error ? (
            <p className="text-red-500">{state.error}</p>
          ) : (
            <p className="text-3xl font-bold">{twilioNumber}</p>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-8">
          If you do not wish to advertise a new number we have also emailed you instructions on how to forward your current phone
        </p>

        {/* dashboard link */}
        {/* <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
          Go to dashboard
        </button> */}
      </div>
    </div>
  );
}
