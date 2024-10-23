// components/details/AdditionalDetailsSection.tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PartialServerStoreData } from '@/lib/types/types';

interface AdditionalDetailsSectionProps {
  formData: PartialServerStoreData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (name: string) => (checked: boolean) => void;
  onNext: () => void;
  isSaving: boolean;
}

export default function AdditionalDetailsSection({ formData, onChange, onSwitchChange, onNext, isSaving }: AdditionalDetailsSectionProps) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="history_and_story">Give us an in-depth overview on the history, theme and story of your restaurant</Label>
        <Textarea
          id="history_and_story"
          name="history_and_story"
          value={formData.history_and_story || ''}
          onChange={onChange}
          className="bg-gray-900 border-[#2E2E2E]"
          placeholder="Write what you would want your best employee to know?"
          disabled={isSaving}
        />
      </div>
      {/* Rest of the additional details fields... */}
      <div className="flex items-center justify-between">
        <Label htmlFor="customer_can_reach_manager">
          If a caller wants to reach a manager or owner, would you like them to be forwarded directly to the restaurant phone?
        </Label>
        <Switch
          id="customer_can_reach_manager"
          checked={formData.customer_can_reach_manager || false}
          onCheckedChange={onSwitchChange('customer_can_reach_manager')}
          disabled={isSaving}
        />
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onNext} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Next'}
      </Button>
    </div>
  );
}
