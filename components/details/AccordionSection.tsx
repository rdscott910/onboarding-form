import { useState } from 'react';
import { Check } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { PartialServerStoreData, RestaurantHours } from '@/lib/types/types';
import RestaurantDetailsSection from './RestaurantDetailsSection';
import RestaurantMenuSection from './RestaurantMenuSection';
import AdditionalDetailsSection from './AdditionalDetailsSection';
import RestHours from '@/components/details/rest-hours';
import { cn } from '@/lib/utils';
import { Section } from '@/app/details/page';

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

export function AccordionSection({ section, formData, isCompleted, isActive, onUpdate, onSaveAndNext, onBack }: AccordionSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ [name]: value });
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

  return (
    <AccordionItem value={section}>
      <AccordionTrigger className={cn('flex items-center justify-between py-4 w-full border-[#2E2E2E]', !isActive && 'opacity-50')}>
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
            onNext={() => onSaveAndNext(section)}
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
      </AccordionContent>
    </AccordionItem>
  );
}

export default AccordionSection;
