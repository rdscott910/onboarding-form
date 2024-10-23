import { AnonymousRegistration, FullLocationData, RestaurantHours } from '@/lib/types/types';

export interface Database {
  public: {
    Tables: {
      anonymous_registrations: {
        Row: AnonymousRegistration;
        Insert: Omit<AnonymousRegistration, 'id' | 'created_at' | 'last_modified'>;
        Update: Partial<Omit<AnonymousRegistration, 'id' | 'created_at' | 'last_modified'>>;
      };
      locations: {
        Row: FullLocationData;
        Insert: Omit<FullLocationData, 'id' | 'created_at'>;
        Update: Partial<Omit<FullLocationData, 'id' | 'created_at'>>;
      };
      restaurant_hours: {
        Row: RestaurantHours;
        Insert: Omit<RestaurantHours, 'id'>;
        Update: Partial<Omit<RestaurantHours, 'id'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      [key: string]: unknown;
    };
  };
}
