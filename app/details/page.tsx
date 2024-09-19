'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Info, Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import RestHours from '@/components/rest-hours';

// NOTE: Removed 'ai-customization' until we are ready to implement it - 9/19/24 RS
const sections = ['restaurant-details', 'hours', 'restaurant-menu', 'additional-details', 'banking-information'];

type RestaurantHours = {
  [key: string]: { openTime: string; closeTime: string }[];
};

interface FormData {
  restaurantName: string;
  streetAddress: string;
  website: string;
  phoneNumber: string;
  internalName: string;
  monthlyOrders: string;
  restaurantHours: RestaurantHours;
  onlineOrderingUrl: string;
  restaurantOverview: string;
  location: string;
  diningOptions: string;
  parkingOptions: string;
  reservationPolicy: string;
  promotionalSchedules: string;
  accessibility: string;
  offerHighChairs: boolean;
  forwardCalls: boolean;
  routingNumber: string;
  accountNumber: string;
  greeting: string;
  selectedVoice: string;
}

export default function AddRestaurantDetails() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>(['restaurant-details']);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    restaurantName: '',
    streetAddress: '',
    website: '',
    phoneNumber: '',
    internalName: '',
    monthlyOrders: '',
    restaurantHours: {},
    onlineOrderingUrl: '',
    restaurantOverview: '',
    location: '',
    diningOptions: '',
    parkingOptions: '',
    reservationPolicy: '',
    promotionalSchedules: '',
    accessibility: '',
    offerHighChairs: false,
    forwardCalls: false,
    routingNumber: '',
    accountNumber: '',
    greeting: '',
    selectedVoice: 'Voice 1',
  });

  const toggleSection = (section: string) => {
    setOpenSections([section]);
  };

  const goToNextSection = (currentSection: string) => {
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      toggleSection(sections[currentIndex + 1]);
    }
    setCompletedSections((prev) => [...prev, currentSection]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  const handleRestaurantHoursChange = (newHours: RestaurantHours) => {
    setFormData((prevData) => ({ ...prevData, restaurantHours: newHours }));
  };

  const handleSubmit = () => {
    console.log('Form data to submit:', formData);
    // Here you would typically send the data to your backend

    // After submitting, route to the /pricing page
    router.push('/pricing');
  };

  const isCompleted = (section: string) => completedSections.includes(section);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
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
                        <Label htmlFor="restaurantName">Restaurant&apos;s Name</Label>
                        <Input
                          id="restaurantName"
                          name="restaurantName"
                          value={formData.restaurantName}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E] border-spacing-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="streetAddress">Restaurant&apos;s Street Address</Label>
                        <Input
                          id="streetAddress"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-1">
                      <div>
                        <Label htmlFor="website">Restaurant&apos;s Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Restaurant&apos;s Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-1">
                      <div>
                        <Label htmlFor="internalName" className="flex items-center">
                          Internal Restaurant Name
                          <Info className="inline-block ml-2 h-4 w-4" />
                        </Label>
                        <Input
                          id="internalName"
                          name="internalName"
                          value={formData.internalName}
                          onChange={handleInputChange}
                          className="bg-gray-900 border-[#2E2E2E]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlyOrders">Your monthly average for orders placed by phone</Label>
                        <Input
                          id="monthlyOrders"
                          name="monthlyOrders"
                          value={formData.monthlyOrders}
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
                  <RestHours
                    hours={formData.restaurantHours}
                    onChange={handleRestaurantHoursChange}
                    onNext={() => goToNextSection('hours')}
                  />
                )}
                {section === 'restaurant-menu' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="onlineOrderingUrl">Online ordering URL</Label>
                      <Input
                        id="onlineOrderingUrl"
                        name="onlineOrderingUrl"
                        value={formData.onlineOrderingUrl}
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
                      <Label htmlFor="restaurantOverview">
                        Give us an in-depth overview on the history, theme and story of your restaurant
                      </Label>
                      <Textarea
                        id="restaurantOverview"
                        name="restaurantOverview"
                        value={formData.restaurantOverview}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write what you would want your best employee to know?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Where are you located in general?</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder='Not your address, but how a employee would respond. "We are on Mill Rd across the street from the Target"'
                      />
                    </div>
                    <div>
                      <Label htmlFor="diningOptions">Dining options (indoor/outdoor/patio, etc)</Label>
                      <Input
                        id="diningOptions"
                        name="diningOptions"
                        value={formData.diningOptions}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parkingOptions">Parking Options</Label>
                      <Input
                        id="parkingOptions"
                        name="parkingOptions"
                        value={formData.parkingOptions}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reservationPolicy">Reservation policy</Label>
                      <Input
                        id="reservationPolicy"
                        name="reservationPolicy"
                        value={formData.reservationPolicy}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="promotionalSchedules">Are their promotional schedules?</Label>
                      <Input
                        id="promotionalSchedules"
                        name="promotionalSchedules"
                        value={formData.promotionalSchedules}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Write your answer here"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accessibility">
                        Tell us about physical accessibility in your restaurant. Give practical information and insights for guests that use
                        wheelchairs or are visually impaired, etc.
                      </Label>
                      <Textarea
                        id="accessibility"
                        name="accessibility"
                        value={formData.accessibility}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="There is wheelchair elevator available on the south side of the building across from the H&R Block"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="offerHighChairs">Do you offer high-chairs?</Label>
                      <Switch
                        id="offerHighChairs"
                        checked={formData.offerHighChairs}
                        onCheckedChange={handleSwitchChange('offerHighChairs')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="forwardCalls">
                        If a caller wants to reach a manager or owner, would you like them to be forwarded directly to the restaurant phone?
                      </Label>
                      <Switch id="forwardCalls" checked={formData.forwardCalls} onCheckedChange={handleSwitchChange('forwardCalls')} />
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
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="000000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="000123456789"
                      />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
                      Submit Restaurant Details
                    </Button>
                  </div>
                )}
                {/* {section === 'ai-customization' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="greeting">Greeting- How do you want Virnika to answer the phone?</Label>
                      <Input
                        id="greeting"
                        name="greeting"
                        value={formData.greeting}
                        onChange={handleInputChange}
                        className="bg-gray-900 border-[#2E2E2E]"
                        placeholder="Phone greeting"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        We recommend &ldquo;Thank you for calling [restaurant name], a digital assistant, how can I help you?&rdquo;
                      </p>
                    </div>
                    <div>
                      <Label>Pick your Virnika voice</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['Voice 1', 'Voice 2', 'Voice 3'].map((voice) => (
                          <Button
                            key={voice}
                            variant="outline"
                            className={`bg-gray-900 border-[#2E2E2E] text-white hover:bg-[#2E2E2E] ${
                              formData.selectedVoice === voice ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setFormData((prevData) => ({ ...prevData, selectedVoice: voice }))}
                          >
                            {voice}
                            <span className="ml-2">▶</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
                      Submit Restaurant Details
                    </Button>
                  </div>
                )} */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
