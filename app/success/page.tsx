'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import HappyFace from '@/components/icons/happy-face';
// import deployTwilioNumber from '@/lib/twilio';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function CongratulationsPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const deployNumber = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTimeout(() => {
        const newNumber = '123456789';
        setTwilioNumber(newNumber);
      }, 5000); // Simulated API call for now
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy Twilio number');
      console.error('Twilio deployment error:', err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      deployNumber();
    }
  };

  useEffect(() => {
    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });

    const timer = setTimeout(() => setShowConfetti(false), 5000);

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Initial deployment
    deployNumber();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const renderTwilioStatus = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-lg">Deploying your number...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center space-y-3">
          <p className="text-red-400">{error}</p>
          {retryCount < 3 && (
            <button onClick={handleRetry} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
              Retry Deployment
            </button>
          )}
          {retryCount >= 3 && <p className="text-sm text-red-400">Maximum retry attempts reached. Please contact support.</p>}
        </div>
      );
    }

    return <p className="text-3xl font-bold">{twilioNumber}</p>;
  };

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
          <p className="text-sm text-gray-400 mb-4">Your new customer facing phone number</p>
          {renderTwilioStatus()}
        </div>

        <p className="text-sm text-gray-400 mb-8">
          If you do not wish to advertise a new number we have also emailed you instructions on how to forward your current phone
        </p>
      </div>
    </div>
  );
}
