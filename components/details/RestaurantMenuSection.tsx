// components/details/RestaurantMenuSection.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PartialServerStoreData } from '@/lib/types/types';

interface RestaurantMenuSectionProps {
  formData: PartialServerStoreData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isSaving: boolean;
}

export default function RestaurantMenuSection({ formData, onChange, onNext, isSaving }: RestaurantMenuSectionProps) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="ordering_url">Online ordering URL</Label>
        <Input
          id="ordering_url"
          name="ordering_url"
          value={formData.ordering_url || ''}
          onChange={onChange}
          className="bg-gray-900 border-[#2E2E2E]"
          placeholder="Enter URL"
          disabled={isSaving}
        />
        <p className="text-sm text-gray-400 mt-1">Leave blank if there is none</p>
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onNext} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Next'}
      </Button>
    </div>
  );
}
