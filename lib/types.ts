export interface FullUserData {
  id?: bigint;
  created_at?: string;
  contact_email: string;
  additional_emails?: string[];
  name: string;
  contact_number: string;
  street_address: string;
  unit_address?: string;
  city_address: string;
  state_address: string;
  zip_address: string;
  website_url?: string;
  ordering_url?: string;
  delivery_url?: string;
  delivery_providers?: string[];
  email_every_call?: boolean;
  number_of_phones?: bigint;
  number_forwarded_to_virnika?: string;
  number_forwarded_to_restaurant?: string;
  employee_title?: string;
  greeting?: string;
  menu_theme_and_description?: string;
  history_and_story?: string;
  seating_options?: string;
  parking_options?: string;
  gift_cards?: string;
  reservation_policy?: string;
  customer_can_reach_manager?: boolean;
  manager_email?: string;
  catering_options?: string;
  larger_parties?: string;
  private_dining?: string;
  misc_info?: string;
  twilio_number?: string;
  service_on?: boolean;
  phone_tree_extensions?: any; // Consider using a more specific type if possible
  television_packages?: string;
  rewards_program?: string;
  disability_info?: string;
  kid_friendly?: string;
  special_events?: string;
  tag?: string;
  deliverect_id?: bigint;
  mealme_id?: string;
  pay_with_stripe?: boolean;
  ordering_on?: boolean;
}

export type PartialUserData = Partial<FullUserData>;

// Define the structure for a single time range
interface TstzRange {
  start: Date;
  end: Date;
}

// Interface for the restaurant_hours table
export interface RestaurantHours {
  id: number;
  day_of_week: number;
  hours: TstzRange[];
  timezone: string;
  location_id: bigint;
}

// Type for partial restaurant hours (useful for updates or inserts)
export type PartialRestaurantHours = Partial<RestaurantHours>;

// Type for the day of the week (0-6, where 0 is Sunday)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Enum for days of the week (for better readability)
export enum WeekDay {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
