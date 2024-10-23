// Path: @/lib/types.ts

/////////////////////////////////////////////////////
// Define `users` table types

// User interface based on the `users` table
export interface User {
  id: string; // UUID
  created_at: string; // timestamptz
  primary_email: string;
  password: string; // This will be hashed
}

// UserInput interface for creating a new user
export interface UserInput {
  primary_email: string;
  password: string;
}

// UserUpdate interface for updating user information
export interface UserUpdate {
  primary_email?: string;
  password?: string;
}

// UserSession interface for managing user sessions
export interface UserSession {
  userId: string;
  expiresAt: number; // Unix timestamp
}

// Omit password from User for safe data transfer
export type SafeUser = Omit<User, 'password'>;

/////////////////////////////////////////////////////
// Define types for the Supabase anonymous_registrations table

export interface AnonymousRegistration {
  id: string;
  created_at: string;
  primary_email: string;
  registration_data: PartialServerStoreData;
  completed: boolean;
  last_modified: string;
}

/////////////////////////////////////////////////////
// Define types for the Supabase locations table

export interface FullLocationData {
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
  phone_tree_extensions?: any;
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

// PartialLocationData is a type that represents a partial set of Location data.
export type PartialLocationData = Partial<FullLocationData>;

// ServerStoreData is a type that extends PartialLocationData and adds additional properties.
export interface ServerStoreData extends PartialLocationData {
  restaurant_hours: RestaurantHours[];
  banking_info?: {
    routing_number: string;
    account_number: string;
  };
  hashedPassword?: string;
  primary_email?: string;
}

export interface ExtendedPartialServerStoreData extends PartialServerStoreData {
  request_type: 'updateRestaurantDetails' | 'submitRootForm';
}

export interface PartialServerStoreData extends Partial<ServerStoreData> {
  registrationId?: string;
  primary_email?: string;
}

export interface GetFormDataResponse {
  formData: PartialServerStoreData | null;
  registrationId: string | null;
}

// TstzRange is a type that represents a range of timestamps.
export interface TstzRange {
  start: Date;
  end: Date;
}

// RestaurantHours is a type that represents the hours of operation for a restaurant.
export interface RestaurantHours {
  id?: number;
  day_of_week: number;
  hours: TstzRange[];
  timezone: string;
  location_id?: bigint;
}

// PartialRestaurantHours is a type that represents a partial set of hours of operation for a restaurant.
export type PartialRestaurantHours = Partial<RestaurantHours>;

// DayOfWeek is a type that represents the days of the week.
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// WeekDay is an enum that represents the days of the week.
export enum WeekDay {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

// Type guard for checking required email
export function hasRequiredEmail(data: PartialServerStoreData): data is PartialServerStoreData & { primary_email: string } {
  return typeof data.primary_email === 'string' && data.primary_email.length > 0;
}
