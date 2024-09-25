'use client';

import React from 'react';
import { PlusIcon, MinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type DayOfWeek = (typeof daysOfWeek)[number];

interface TimeRange {
  openTime: string;
  closeTime: string;
}

type RestaurantHours = {
  [key in DayOfWeek]?: TimeRange[];
};

interface RestHoursProps {
  hours: RestaurantHours;
  onChange: (hours: RestaurantHours) => void;
  onNext: () => void;
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => (
  <Input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-28 bg-gray-700 text-white border-gray-600" />
);

/// HoursPair component
interface HoursPairProps {
  openTime: string;
  closeTime: string;
  onOpenChange: (value: string) => void;
  onCloseChange: (value: string) => void;
  onRemove: () => void;
}

const HoursPair: React.FC<HoursPairProps> = ({ openTime, closeTime, onOpenChange, onCloseChange, onRemove }) => (
  <div className="flex items-center space-x-2 mb-2">
    <TimeInput value={openTime} onChange={onOpenChange} />
    <span className="text-gray-400">to</span>
    <TimeInput value={closeTime} onChange={onCloseChange} />
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            onClick={onRemove}
            className="text-red-500 p-2 bg-transparent border-red-500 border border-opacity-30 hover:text-red-600 hover:bg-red-800 hover:bg-opacity-10 hover:border-red-600"
          >
            <MinusIcon className="h-5 w-5" />
            <span className="ml-1 text-xs">Remove</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove Hours</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);
/// End of HoursPair component

/// DayHours component
interface DayHoursProps {
  day: DayOfWeek;
  hours: TimeRange[];
  onChange: (hours: TimeRange[]) => void;
}

const DayHours: React.FC<DayHoursProps> = ({ day, hours, onChange }) => {
  const addHours = () => {
    onChange([...hours, { openTime: '09:00', closeTime: '17:00' }]);
  };

  const updateHours = (index: number, field: keyof TimeRange, value: string) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    onChange(newHours);
  };

  const removeHours = (index: number) => {
    const newHours = hours.filter((_, i) => i !== index);
    onChange(newHours);
  };

  return (
    <div className="flex items-center space-x-4 py-2 border-b border-gray-700">
      <div className="w-28 text-gray-300">{day}</div>
      <div className="flex-grow">
        {hours.map((hour, index) => (
          <HoursPair
            key={index}
            openTime={hour.openTime}
            closeTime={hour.closeTime}
            onOpenChange={(value) => updateHours(index, 'openTime', value)}
            onCloseChange={(value) => updateHours(index, 'closeTime', value)}
            onRemove={() => removeHours(index)}
          />
        ))}
        {hours.length === 0 && <div className="text-red-400 italic bg-red-900 bg-opacity-20 rounded-md px-2 py-1 inline-block">Closed</div>}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="default"
              onClick={addHours}
              className="text-green-500 p-2 bg-transparent border-green-500 border border-opacity-30 hover:text-green-600 hover:bg-green-800 hover:bg-opacity-10 hover:border-green-600"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="ml-1 text-xs">Add</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Hours</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
/// End of DayHours component

/// RestHours component
const RestHours: React.FC<RestHoursProps> = ({ hours, onChange, onNext }) => {
  const updateHours = (day: DayOfWeek, newHours: TimeRange[]) => {
    onChange({ ...hours, [day]: newHours });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      {daysOfWeek.map((day) => (
        <DayHours key={day} day={day} hours={hours[day] || []} onChange={(newHours) => updateHours(day, newHours)} />
      ))}
      <div className="mt-6">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default RestHours;
