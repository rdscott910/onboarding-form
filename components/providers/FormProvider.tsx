'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PartialServerStoreData } from '@/lib/types/types';
import { updateRegistrationData } from '@/lib/supabase-client';

interface FormContextType {
  formData: PartialServerStoreData;
  updateFormData: (data: Partial<PartialServerStoreData>) => void;
  saveFormData: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PartialServerStoreData>(() => ({
    primary_email: user?.email || '',
    restaurant_name: '',
    restaurant_address: '',
    restaurant_hours: [],
    restaurant_website: '',
    menu_url: '',
    additional_details: {
      history: '',
      location_description: '',
      dining_options: '',
      parking_options: '',
    },
    banking_info: {
      routing_number: '',
      account_number: '',
    },
  }));

  // Update form data when user changes
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        primary_email: user.email || '',
      }));
    }
  }, [user?.email]);

  const updateFormData = (data: Partial<PartialServerStoreData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const saveFormData = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await updateRegistrationData(user.email, formData);
      if (!success) {
        setError('Failed to save form data');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving form data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return <FormContext.Provider value={{ formData, updateFormData, saveFormData, isLoading, error }}>{children}</FormContext.Provider>;
}

export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}
