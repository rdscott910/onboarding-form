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
  const [twilioNumber, setTwilioNumber] = useState<string | null>('123456789');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { innerWidth: width, innerHeight: height } = window;
    setDimensions({ width, height });
    const timer = setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
    const loadingTimer = setTimeout(() => setIsLoading(false), 5000); // Stop loading after 5 seconds
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);

    // Deploy Twilio number
    // const deployNumber = async () => {
    //   try {
    //     const restaurantName = 'Your Restaurant Name'; // Replace with actual restaurant name
    //     const streetAddr = 'Your Street Address'; // Replace with actual street address
    //     const newNumber = await deployTwilioNumber(restaurantName, streetAddr);
    //     setTwilioNumber(newNumber);
    //   } catch (err) {
    //     setError('Failed to deploy Twilio number. Please try again later.');
    //     console.error(err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // deployNumber();

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          {isLoading ? (
            <p className="text-3xl font-bold">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
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
