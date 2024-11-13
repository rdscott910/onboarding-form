'use client';

import React from 'react';
import { PlusIcon, MinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RestaurantHours, TstzRange, WeekDay } from '@/lib/types/types';

interface RestHoursProps {
  hours: RestaurantHours[];
  onChange: (hours: RestaurantHours[]) => void;
  onNext: () => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, disabled }) => (
  <Input
    type="time"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-28 bg-gray-700 text-white border-gray-600"
    disabled={disabled}
  />
);

interface HoursPairProps {
  openTime: string;
  closeTime: string;
  onOpenChange: (value: string) => void;
  onCloseChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const HoursPair: React.FC<HoursPairProps> = ({ openTime, closeTime, onOpenChange, onCloseChange, onRemove, disabled }) => (
  <div className="flex items-center space-x-2 mb-2">
    <TimeInput value={openTime} onChange={onOpenChange} disabled={disabled} />
    <span className="text-gray-400">to</span>
    <TimeInput value={closeTime} onChange={onCloseChange} disabled={disabled} />
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="default"
            onClick={onRemove}
            disabled={disabled}
            className="text-red-500 p-2 bg-transparent border-red-500 border border-opacity-30 hover:text-red-600 hover:bg-red-800 hover:bg-opacity-10 hover:border-red-600 disabled:opacity-50"
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

interface DayHoursProps {
  day: WeekDay;
  hours: TstzRange[];
  onChange: (hours: TstzRange[]) => void;
  disabled?: boolean;
}

const DayHours: React.FC<DayHoursProps> = ({ day, hours, onChange, disabled }) => {
  const addHours = () => {
    onChange([...hours, { start: new Date(), end: new Date() }]);
  };

  const updateHours = (index: number, field: keyof TstzRange, value: string) => {
    const newHours = [...hours];
    const [hours_, minutes] = value.split(':').map(Number);
    const newDate = new Date(newHours[index][field]);
    newDate.setHours(hours_, minutes);
    newHours[index] = { ...newHours[index], [field]: newDate };
    onChange(newHours);
  };

  const removeHours = (index: number) => {
    const newHours = hours.filter((_, i) => i !== index);
    onChange(newHours);
  };

  // Convert string dates to Date objects
  const parsedHours = hours.map((hour) => ({
    start: hour.start instanceof Date ? hour.start : new Date(hour.start),
    end: hour.end instanceof Date ? hour.end : new Date(hour.end),
  }));

  return (
    <div className="flex items-center space-x-4 py-2 border-b border-gray-700">
      <div className="w-28 text-gray-300">{WeekDay[day]}</div>
      <div className="flex-grow">
        {parsedHours.map((hour, index) => (
          <HoursPair
            key={index}
            openTime={hour.start.toTimeString().slice(0, 5)}
            closeTime={hour.end.toTimeString().slice(0, 5)}
            onOpenChange={(value) => updateHours(index, 'start', value)}
            onCloseChange={(value) => updateHours(index, 'end', value)}
            onRemove={() => removeHours(index)}
            disabled={disabled}
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
              disabled={disabled}
              className="text-green-500 p-2 bg-transparent border-green-500 border border-opacity-30 hover:text-green-600 hover:bg-green-800 hover:bg-opacity-10 hover:border-green-600 disabled:opacity-50"
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

const WEEKDAYS = Array.from({ length: 7 }, (_, i) => i) as WeekDay[];

const RestHours: React.FC<RestHoursProps> = ({ hours, onChange, onNext, onBack, isSaving = false }) => {
  const updateHours = (day: WeekDay, newHours: TstzRange[]) => {
    const updatedHours = [...hours];
    const existingDayIndex = updatedHours.findIndex((h) => h.day_of_week === day);

    // Ensure the hours are Date objects
    const parsedNewHours = newHours.map((hour) => ({
      start: hour.start instanceof Date ? hour.start : new Date(hour.start),
      end: hour.end instanceof Date ? hour.end : new Date(hour.end),
    }));

    if (existingDayIndex !== -1) {
      updatedHours[existingDayIndex] = {
        ...updatedHours[existingDayIndex],
        hours: parsedNewHours,
      };
    } else {
      updatedHours.push({
        day_of_week: day,
        hours: parsedNewHours,
        timezone: 'UTC',
      } as RestaurantHours);
    }

    onChange(updatedHours);
  };

  // Ensure initial hours are properly parsed
  const parsedInitialHours = hours.map((dayHours) => ({
    ...dayHours,
    hours: dayHours.hours.map((hour) => ({
      start: hour.start instanceof Date ? hour.start : new Date(hour.start),
      end: hour.end instanceof Date ? hour.end : new Date(hour.end),
    })),
  }));

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      {WEEKDAYS.map((day) => (
        <DayHours
          key={day}
          day={day}
          hours={parsedInitialHours.find((h) => h.day_of_week === day)?.hours || []}
          onChange={(newHours) => updateHours(day, newHours)}
          disabled={isSaving}
        />
      ))}
      <div className="mt-6 flex gap-4">
        <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50" onClick={onNext} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default RestHours;
