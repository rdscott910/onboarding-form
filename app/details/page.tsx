'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PartialServerStoreData, GetFormDataResponse } from '@/lib/types/types';
import { SessionData } from '@/lib/types/session';
import { getCsrfToken } from '@/lib/csrfToken';
import { updateRegistrationData } from '@/lib/supabase-client';
import AccordionSection from '@/components/details/AccordionSection';

const INITIAL_FORM_DATA: PartialServerStoreData = {
  name: '',
  street_address: '',
  website_url: '',
  contact_number: '',
  contact_email: '',
  ordering_url: '',
  menu_theme_and_description: '',
  history_and_story: '',
  seating_options: '',
  parking_options: '',
  reservation_policy: '',
  disability_info: '',
  kid_friendly: '',
  customer_can_reach_manager: false,
  greeting: '',
  restaurant_hours: [],
  banking_info: {
    routing_number: '',
    account_number: '',
  },
};

type Section = 'restaurant-details' | 'hours' | 'restaurant-menu' | 'additional-details' | 'banking-information';

const SECTIONS: Section[] = ['restaurant-details', 'hours', 'restaurant-menu', 'additional-details', 'banking-information'];

interface PageState {
  isLoading: boolean;
  error: string | null;
  openSections: Section[];
  completedSections: Section[];
  formData: PartialServerStoreData;
  session: SessionData | null;
}

export default function AddRestaurantDetails() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    openSections: ['restaurant-details'],
    completedSections: [],
    formData: INITIAL_FORM_DATA,
    session: null,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const csrfToken = await getCsrfToken();
        const response = await fetch('/api/get-form-data', {
          headers: { 'X-CSRF-Token': csrfToken },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }

        const data: GetFormDataResponse = await response.json();

        if (data.formData) {
          // Extract session data if available
          const session =
            data.formData.primary_email && data.registrationId
              ? {
                  primary_email: data.formData.primary_email,
                  registrationId: data.registrationId,
                }
              : null;

          // Calculate completed sections
          const completed = getCompletedSections(data.formData);

          setState((prev) => ({
            ...prev,
            formData: {
              ...INITIAL_FORM_DATA,
              ...data.formData,
            },
            session,
            completedSections: completed,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: 'An error occurred while retrieving your data. Please try again.',
          isLoading: false,
        }));
      }
    };

    fetchFormData();
  }, []);

  // Helper function to determine completed sections - now explicitly returns Section[]
  const getCompletedSections = (formData: PartialServerStoreData): Section[] => {
    return SECTIONS.filter((section) => {
      const sectionFields = Object.entries(formData)
        .filter(([key]) => key.includes(section.replace('-', '_')))
        .map(([_, value]) => value);

      return sectionFields.some((value) => value && (typeof value === 'object' ? Object.keys(value).length > 0 : true));
    });
  };

  const handleFormUpdate = (updates: Partial<PartialServerStoreData>) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...updates,
      },
    }));
  };

  const handleSaveAndNext = async (currentSection: Section) => {
    // Type as Section
    if (!state.session?.primary_email) {
      setState((prev) => ({
        ...prev,
        error: 'Session data is missing. Please try again.',
      }));
      return;
    }

    try {
      const success = await updateRegistrationData(state.session.primary_email, state.formData);

      if (!success) {
        throw new Error('Failed to update registration data');
      }

      const currentIndex = SECTIONS.indexOf(currentSection);
      if (currentIndex < SECTIONS.length - 1) {
        setState((prev) => ({
          ...prev,
          openSections: [SECTIONS[currentIndex + 1]],
          completedSections: [...new Set([...prev.completedSections, currentSection])], // currentSection is now properly typed
          error: null,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save changes',
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!state.session?.primary_email) {
        throw new Error('Session data is missing');
      }

      const success = await updateRegistrationData(state.session.primary_email, state.formData);

      if (!success) {
        throw new Error('Failed to update registration data');
      }

      router.push('/pricing');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save changes',
      }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{state.error}</p>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Go back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Add restaurant details</h1>
        <p className="text-center text-gray-400 mb-8">
          Want to add multiple restaurants? Create an account for your first location and you can quickly create more locations after
          signing up.
        </p>

        <Accordion type="single" value={state.openSections[0]} className="space-y-4">
          {SECTIONS.map((section) => (
            <AccordionSection
              key={section}
              section={section}
              formData={state.formData}
              isCompleted={state.completedSections.includes(section)}
              onUpdate={handleFormUpdate}
              onSaveAndNext={() => handleSaveAndNext(section)}
              onSubmit={handleSubmit}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
