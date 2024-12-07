'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion } from '@/components/ui/accordion';
import { PartialServerStoreData } from '@/lib/types/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { getRegistrationData } from '@/lib/supabase-client';
import { useForm } from '@/components/providers/FormProvider';
import AccordionSection from '@/components/details/AccordionSection';

export type Section = 'restaurant-details' | 'hours' | 'restaurant-menu' | 'additional-details';

const SECTIONS: Section[] = ['restaurant-details', 'hours', 'restaurant-menu', 'additional-details'];

interface PageState {
  isLoading: boolean;
  error: string | null;
  currentSection: Section;
  completedSections: Section[];
}

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

export default function AddRestaurantDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { formData, updateFormData, saveFormData } = useForm();

  const [pageState, setPageState] = useState<PageState>({
    isLoading: true,
    error: null,
    currentSection: SECTIONS[0],
    completedSections: [],
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const data = await getRegistrationData(user?.email || '');
        if (data) {
          updateFormData(data);
          // Update completed sections based on data
          const completed = SECTIONS.filter((section) => {
            switch (section) {
              case 'restaurant-details':
                return !!data.name && !!data.street_address;
              case 'hours':
                return data.restaurant_hours && data.restaurant_hours.length > 0;
              case 'restaurant-menu':
                return !!data.ordering_url;
              case 'additional-details':
                return !!data.history_and_story;
              default:
                return false;
            }
          });
          setPageState((prev) => ({ ...prev, completedSections: completed }));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        setPageState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load form data',
        }));
      }
    };
    loadFormData();
    setPageState((prev) => ({ ...prev, isLoading: false }));
  }, [user, router, updateFormData]);

  const handleSectionComplete = async (section: Section) => {
    if (!user) {
      setPageState((prev) => ({
        ...prev,
        error: 'Your session has expired. Please sign in again.',
      }));
      router.push('/');
      return;
    }

    try {
      const success = await saveFormData();
      if (success) {
        setPageState((prev) => ({
          ...prev,
          completedSections: [...prev.completedSections, section],
          currentSection: SECTIONS[SECTIONS.indexOf(section) + 1],
        }));
      }
    } catch (error) {
      console.error('Error saving section:', error);
      setPageState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save section',
      }));
    }
  };

  const handleBack = (section: Section) => {
    setPageState((prev) => ({
      ...prev,
      currentSection: section,
    }));
  };

  const handleSubmit = async () => {
    try {
      const success = await saveFormData();
      if (success) {
        router.push('/pricing');
      }
    } catch (error) {
      setPageState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit form',
      }));
    }
  };

  if (pageState.isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Restaurant Details</h1>
          <p className="text-gray-400 mt-2">Please fill out the following information about your restaurant</p>
        </div>

        {pageState.error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded">{pageState.error}</div>}

        <Accordion type="single" collapsible defaultValue={pageState.currentSection}>
          {SECTIONS.map((section) => (
            <AccordionSection
              key={section}
              section={section}
              formData={formData}
              isCompleted={pageState.completedSections.includes(section)}
              isActive={pageState.currentSection === section}
              currentSection={pageState.currentSection}
              onUpdate={updateFormData}
              onSaveAndNext={handleSectionComplete}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
