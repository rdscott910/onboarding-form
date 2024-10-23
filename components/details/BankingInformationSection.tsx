// components/details/BankingInformationSection.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PartialServerStoreData } from '@/lib/types/types';

interface BankingInformationSectionProps {
  formData: PartialServerStoreData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBankingInfoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isSaving: boolean;
}

export default function BankingInformationSection({
  formData,
  onChange,
  onBankingInfoChange,
  onSubmit,
  isSaving,
}: BankingInformationSectionProps) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="routing_number">Routing Number</Label>
        <Input
          id="routing_number"
          name="routing_number"
          value={formData.banking_info?.routing_number || ''}
          onChange={onBankingInfoChange}
          className="bg-gray-900 border-[#2E2E2E]"
          placeholder="000000000"
          disabled={isSaving}
        />
      </div>
      <div>
        <Label htmlFor="account_number">Account Number</Label>
        <Input
          id="account_number"
          name="account_number"
          value={formData.banking_info?.account_number || ''}
          onChange={onBankingInfoChange}
          className="bg-gray-900 border-[#2E2E2E]"
          placeholder="000123456789"
          disabled={isSaving}
        />
      </div>
      <div>
        <Label htmlFor="greeting">Greeting - How do you want Virnika to answer the phone?</Label>
        <Input
          id="greeting"
          name="greeting"
          value={formData.greeting || ''}
          onChange={onChange}
          className="bg-gray-900 border-[#2E2E2E]"
          placeholder="Thank you for calling [restaurant name], a digital assistant, how can I help you?"
          disabled={isSaving}
        />
      </div>
      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onSubmit} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Submit Restaurant Details'}
      </Button>
    </div>
  );
}
