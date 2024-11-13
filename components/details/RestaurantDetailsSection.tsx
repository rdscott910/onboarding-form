// components/details/RestaurantDetailsSection.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PartialServerStoreData } from '@/lib/types/types';

interface RestaurantDetailsSectionProps {
  formData: PartialServerStoreData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => Promise<void>;
  isSaving: boolean;
  isFirstSection: boolean;
}

export default function RestaurantDetailsSection({ formData, onChange, onNext, isSaving, isFirstSection }: RestaurantDetailsSectionProps) {
  return (
    <div className="space-y-4 mt-4 w-full">
      <div className="grid grid-cols-2 gap-3 p-1">
        <div>
          <Label htmlFor="name">Restaurant&apos;s Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={onChange}
            className="bg-gray-900 border-[#2E2E2E] border-spacing-2"
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="street_address">Restaurant&apos;s Street Address</Label>
          <Input
            id="street_address"
            name="street_address"
            value={formData.street_address || ''}
            onChange={onChange}
            className="bg-gray-900 border-[#2E2E2E]"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-1">
        <div>
          <Label htmlFor="website_url">Restaurant&apos;s Website</Label>
          <Input
            id="website_url"
            name="website_url"
            value={formData.website_url || ''}
            onChange={onChange}
            className="bg-gray-900 border-[#2E2E2E]"
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="contact_number">Restaurant&apos;s Phone Number</Label>
          <Input
            id="contact_number"
            name="contact_number"
            value={formData.contact_number || ''}
            onChange={onChange}
            className="bg-gray-900 border-[#2E2E2E]"
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Restaurant&apos;s Email *</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            required
            value={formData.contact_email || ''}
            onChange={onChange}
            className="bg-gray-900 border-[#2E2E2E] border-spacing-2"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          className="w-full bg-gray-700 hover:bg-gray-600 text-white"
          disabled={isFirstSection || isSaving}
          style={{ visibility: isFirstSection ? 'hidden' : 'visible' }}
        >
          Back
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onNext} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
