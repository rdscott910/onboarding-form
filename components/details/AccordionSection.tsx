// components/details/AccordionSection.tsx
import { useState } from 'react';
import { Check } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PartialServerStoreData, RestaurantHours } from '@/lib/types/types';
import RestaurantDetailsSection from './RestaurantDetailsSection';
import RestaurantMenuSection from './RestaurantMenuSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import BankingInformationSection from './BankingInformationSection';
import RestHours from '@/components/rest-hours';

interface AccordionSectionProps {
  section: string;
  formData: PartialServerStoreData;
  isCompleted: boolean;
  onUpdate: (updates: Partial<PartialServerStoreData>) => void; // Local state update
  onSaveAndNext: (currentSection: string) => Promise<void>; // Database update
  onSubmit: () => Promise<void>;
}

export function AccordionSection({ section, formData, isCompleted, onUpdate, onSaveAndNext, onSubmit }: AccordionSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleBankingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({
      banking_info: {
        routing_number: formData.banking_info?.routing_number || '',
        account_number: formData.banking_info?.account_number || '',
        [name]: value,
      },
    });
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    onUpdate({ [name]: checked });
  };

  const handleHoursChange = (hours: RestaurantHours[]) => {
    onUpdate({ restaurant_hours: hours });
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      await onSaveAndNext(section);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSubmit();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccordionItem value={section}>
      <AccordionTrigger className="flex items-center justify-between py-4 w-full border-[#2E2E2E]">
        <div className="flex items-center">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 
              ${isCompleted ? 'border-green-500 bg-green-500' : 'border-gray-500'}`}
          >
            <Check className={`h-4 w-4 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
          </div>
          <span className="text-lg">
            {section
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {section === 'restaurant-details' && (
          <RestaurantDetailsSection formData={formData} onChange={handleInputChange} onNext={handleNext} isSaving={isSaving} />
        )}
        {section === 'hours' && (
          <RestHours hours={formData.restaurant_hours || []} onChange={handleHoursChange} onNext={handleNext} isSaving={isSaving} />
        )}
        {section === 'restaurant-menu' && (
          <RestaurantMenuSection formData={formData} onChange={handleInputChange} onNext={handleNext} isSaving={isSaving} />
        )}
        {section === 'additional-details' && (
          <AdditionalDetailsSection
            formData={formData}
            onChange={handleInputChange}
            onSwitchChange={handleSwitchChange}
            onNext={handleNext}
            isSaving={isSaving}
          />
        )}
        {section === 'banking-information' && (
          <BankingInformationSection
            formData={formData}
            onChange={handleInputChange}
            onBankingInfoChange={handleBankingInfoChange}
            onSubmit={handleSubmit}
            isSaving={isSaving}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default AccordionSection;
