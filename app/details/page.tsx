'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import RestHours from '@/components/rest-hours';
import { PartialUserData, RestaurantHours, PartialRestaurantHours, WeekDay } from '@/lib/types';

const sections = ['restaurant-details', 'hours', 'restaurant-menu', 'additional-details', 'banking-information'];

const initialFormData: PartialUserData = {
  name: '',
  street_address: '',
  website_url: '',
  contact_number: '',
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
};

export default function AddRestaurantDetails() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['restaurant-details']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [formData, setFormData] = useState<PartialUserData>(initialFormData);
  const [restaurantHours, setRestaurantHours] = useState<PartialRestaurantHours[]>([]);

  const handleRestaurantHoursChange = (newHours: PartialRestaurantHours[]) => {
    setRestaurantHours(newHours);
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch('/api/get-form-data');
        if (!response.ok) {
          throw new Error('Failed to fetch form data');
        }
        const data = await response.json();
        if (data.formData) {
          setFormData(data.formData);
          // Set completed sections based on filled data
          const completed = Object.entries(data.formData).reduce((acc, [key, value]) => {
            if (value && typeof value === 'object' && Object.keys(value).length > 0) {
              acc.push(sections.find((section) => section.includes(key)) || '');
            } else if (value && typeof value !== 'object') {
              acc.push(sections.find((section) => section.includes(key)) || '');
            }
            return acc;
          }, [] as string[]);
          setCompletedSections([...new Set(completed.filter(Boolean))]);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('An error occurred while retrieving your data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections([section]);
  };

  const tempStoreFormData = async () => {
    const fullFormData = {
      ...formData,
      restaurant_hours: restaurantHours,
    };

    try {
      const response = await fetch('/api/save-form-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to save form data');
      }
    } catch (error) {
      console.error('Error saving form data:', error);
      setError('An error occurred while saving your progress. Please try again.');
    }
  };

  const goToNextSection = async (currentSection: string) => {
    await tempStoreFormData();
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      toggleSection(sections[currentIndex + 1]);
    }
    setCompletedSections((prev) => [...new Set([...prev, currentSection])]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  const handleSubmit = async () => {
    await tempStoreFormData();
    router.push('/pricing');
  };

  const isCompleted = (section: string) => completedSections.includes(section);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Go back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Add restaurant details</h1>
        <p className="text-center text-gray-400 mb-8">
          Wanting to add multiple restaurants? Create an account for your first location and you can quickly create more locations after
          signing up.
        </p>

        <Accordion type="single" value={openSections[0]} className="space-y-4">
          {sections.map((section) => (
            <AccordionItem key={section} value={section}>
              <AccordionTrigger
                onClick={() => toggleSection(section)}
                className="flex items-center justify-between py-4 w-full border-[#2E2E2E]"
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                      isCompleted(section) ? 'border-green-500 bg-green-500' : 'border-gray-500'
                    }`}
                  >
                    <Check className={`h-4 w-4 ${isCompleted(section) ? 'text-white' : 'text-gray-500'}`} />
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
                  <div className="space-y-4 mt-4 w-full">
                    <div className="grid grid-cols-2 gap-3 p-1">
                      <div>
                        <Label htmlFor="name">Restaurant's Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E] border-spacing-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="street_address">Restaurant's Street Address</Label>
                        <Input
                          id="street_address"
                          name="street_address"
                          value={formData.street_address}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-1">
                      <div>
                        <Label htmlFor="website_url">Restaurant's Website</Label>
                        <Input
                          id="website_url"
                          name="website_url"
                          value={formData.website_url}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_number">Restaurant's Phone Number</Label>
                        <Input
                          id="contact_number"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => goToNextSection('restaurant-details')}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {section === 'hours' && (
                  <RestHours hours={restaurantHours} onChange={handleRestaurantHoursChange} onNext={() => goToNextSection('hours')} />
                )}
                {section === 'restaurant-menu' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="ordering_url">Online ordering URL</Label>
                      <Input
                        id="ordering_url"
                        name="ordering_url"
                        value={formData.ordering_url}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Enter URL"
                      />
                      <p className="text-sm text-gray-400 mt-1">Leave blank if there is none</p>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => goToNextSection('restaurant-menu')}>
                      Next
                    </Button>
                  </div>
                )}
                {section === 'additional-details' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="history_and_story">
                        Give us an in-depth overview on the history, theme and story of your restaurant
                      </Label>
                      <Textarea
                        id="history_and_story"
                        name="history_and_story"
                        value={formData.history_and_story}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write what you would want your best employee to know?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seating_options">Dining options (indoor/outdoor/patio, etc)</Label>
                      <Input
                        id="seating_options"
                        name="seating_options"
                        value={formData.seating_options}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parking_options">Parking Options</Label>
                      <Input
                        id="parking_options"
                        name="parking_options"
                        value={formData.parking_options}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reservation_policy">Reservation policy</Label>
                      <Input
                        id="reservation_policy"
                        name="reservation_policy"
                        value={formData.reservation_policy}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="disability_info">
                        Tell us about physical accessibility in your restaurant. Give practical information and insights for guests that use
                        wheelchairs or are visually impaired, etc.
                      </Label>
                      <Textarea
                        id="disability_info"
                        name="disability_info"
                        value={formData.disability_info}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="There is wheelchair elevator available on the south side of the building across from the H&R Block"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kid_friendly">Do you offer high-chairs or other kid-friendly options?</Label>
                      <Input
                        id="kid_friendly"
                        name="kid_friendly"
                        value={formData.kid_friendly}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="customer_can_reach_manager">
                        If a caller wants to reach a manager or owner, would you like them to be forwarded directly to the restaurant phone?
                      </Label>
                      <Switch
                        id="customer_can_reach_manager"
                        checked={formData.customer_can_reach_manager}
                        onCheckedChange={handleSwitchChange('customer_can_reach_manager')}
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => goToNextSection('additional-details')}
                    >
                      Next
                    </Button>
                  </div>
                )}
                {section === 'banking-information' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="greeting">Greeting - How do you want Virnika to answer the phone?</Label>
                      <Input
                        id="greeting"
                        name="greeting"
                        value={formData.greeting}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Thank you for calling [restaurant name], a digital assistant, how can I help you?"
                      />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
                      Submit Restaurant Details
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
