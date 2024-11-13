import { useState } from 'react';
import { Check } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PartialServerStoreData, RestaurantHours } from '@/lib/types/types';
import RestaurantDetailsSection from './RestaurantDetailsSection';
import RestaurantMenuSection from './RestaurantMenuSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import BankingInformationSection from './BankingInformationSection';
import RestHours from '@/components/rest-hours';

type Section = 'restaurant-details' | 'hours' | 'restaurant-menu' | 'additional-details' | 'banking-information';

interface AccordionSectionProps {
  section: Section;
  formData: PartialServerStoreData;
  isCompleted: boolean;
  isActive: boolean;
  currentSection: Section;
  onUpdate: (updates: Partial<PartialServerStoreData>) => void;
  onSaveAndNext: (currentSection: Section) => Promise<void>;
  onBack: (section: Section) => void;
  onSubmit: () => Promise<void>;
}

export function AccordionSection({
  section,
  formData,
  isCompleted,
  isActive,
  currentSection,
  onUpdate,
  onSaveAndNext,
  onBack,
  onSubmit,
}: AccordionSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
  };

  const handleBankingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({
      banking_info: {
        ...formData.banking_info,
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

  const getPreviousSection = (current: Section): Section | null => {
    const sections: Section[] = ['restaurant-details', 'hours', 'restaurant-menu', 'additional-details', 'banking-information'];
    const currentIndex = sections.indexOf(current);
    return currentIndex > 0 ? sections[currentIndex - 1] : null;
  };

  return (
    <AccordionItem value={section}>
      <AccordionTrigger className="flex items-center justify-between py-4 w-full border-[#2E2E2E]">
        <div className="flex items-center justify-between w-full">
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
          {isCompleted && !isActive && <span className="text-sm text-gray-400">Click to edit</span>}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {section === 'restaurant-details' && (
          <RestaurantDetailsSection
            formData={formData}
            onChange={handleInputChange}
            onNext={handleNext}
            isSaving={isSaving}
            isFirstSection={true}
          />
        )}
        {section === 'hours' && (
          <RestHours
            hours={formData.restaurant_hours || []}
            onChange={handleHoursChange}
            onNext={handleNext}
            onBack={() => onBack('restaurant-details')}
            isSaving={isSaving}
          />
        )}
        {section === 'restaurant-menu' && (
          <RestaurantMenuSection
            formData={formData}
            onChange={handleInputChange}
            onNext={handleNext}
            onBack={() => onBack('hours')}
            isSaving={isSaving}
          />
        )}
        {section === 'additional-details' && (
          <AdditionalDetailsSection
            formData={formData}
            onChange={handleInputChange}
            onSwitchChange={handleSwitchChange}
            onNext={handleNext}
            onBack={() => onBack('restaurant-menu')}
            isSaving={isSaving}
          />
        )}
        {section === 'banking-information' && (
          <BankingInformationSection
            formData={formData}
            onChange={handleInputChange}
            onBankingInfoChange={handleBankingInfoChange}
            onSubmit={handleSubmit}
            onBack={() => onBack('additional-details')}
            isSaving={isSaving}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export default AccordionSection;
