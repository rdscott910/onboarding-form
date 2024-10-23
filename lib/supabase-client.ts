import { createClient } from '@supabase/supabase-js';
import { FullLocationData, RestaurantHours, PartialServerStoreData, AnonymousRegistration } from '@/lib/types/types';
import { SessionData } from '@/lib/types/session';
import { Database } from '@/lib/types/supabase';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided');
}
const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

export async function getSession(): Promise<SessionData | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function createSession(email: string, data?: any): Promise<SessionData | null> {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, data }),
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

export async function getOrCreateRegistration(primary_email: string, initialData?: PartialServerStoreData): Promise<SessionData | null> {
  try {
    // First, try to get existing registration
    const { data: existingRegistration, error: fetchError } = await supabaseClient
      .from('anonymous_registrations')
      .select('*')
      .eq('primary_email', primary_email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found"
      throw fetchError;
    }

    if (existingRegistration) {
      return {
        primary_email: existingRegistration.primary_email,
        registrationId: existingRegistration.id,
      };
    }

    if (initialData) {
      // Create new registration if it doesn't exist
      const { data: newRegistration, error: insertError } = await supabaseClient
        .from('anonymous_registrations')
        .insert([
          {
            primary_email,
            registration_data: {
              ...initialData,
              primary_email,
            },
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (newRegistration) {
        return {
          primary_email: newRegistration.primary_email,
          registrationId: newRegistration.id,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error in getOrCreateRegistration:', error);
    return null;
  }
}

export async function updateRegistrationData(primary_email: string, formData: PartialServerStoreData): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('anonymous_registrations')
      .update({
        registration_data: {
          ...formData,
          primary_email,
        },
      })
      .eq('primary_email', primary_email);

    return !error;
  } catch (error) {
    console.error('Error updating registration data:', error);
    return false;
  }
}

export async function getRegistrationData(primary_email: string): Promise<PartialServerStoreData | null> {
  try {
    const { data, error } = await supabaseClient
      .from('anonymous_registrations')
      .select('registration_data')
      .eq('primary_email', primary_email)
      .single();

    if (error) throw error;
    return data?.registration_data || null;
  } catch (error) {
    console.error('Error fetching registration data:', error);
    return null;
  }
}

export async function completeRegistration(primary_email: string): Promise<boolean> {
  try {
    const { error } = await supabaseClient.from('anonymous_registrations').update({ completed: true }).eq('primary_email', primary_email);

    return !error;
  } catch (error) {
    console.error('Error completing registration:', error);
    return false;
  }
}

export async function insertLocationDataToSupabase(locationData: FullLocationData) {
  try {
    const cleanedData = deepCleanUndefined(locationData);
    const { data, error } = await supabaseClient.from('locations').insert([cleanedData]).select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    throw error;
  }
}

export async function getRestaurantHours(locationId: bigint) {
  const { data, error } = await supabaseClient.from('restaurant_hours').select('*').eq('location_id', locationId);

  if (error) throw error;
  return data;
}

export async function createOrUpdateRestHours(hours: RestaurantHours[]): Promise<any> {
  try {
    const cleanedHours = deepCleanUndefined(hours);
    const { data, error } = await supabaseClient.from('restaurant_hours').upsert(cleanedHours).select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting restaurant hours into Supabase:', error);
    throw error;
  }
}

/**
 * Recursively removes all properties with `undefined` values from an object or array.
 */
function deepCleanUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(deepCleanUndefined).filter((v) => v !== undefined) as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, deepCleanUndefined(v)])
        .filter(([_, v]) => v !== undefined)
    ) as T;
  }
  return obj;
}

// Type guard for checking if an unknown value matches AnonymousRegistration
function isAnonymousRegistration(obj: unknown): obj is AnonymousRegistration {
  if (!obj || typeof obj !== 'object') return false;

  const registration = obj as AnonymousRegistration;
  return (
    typeof registration.id === 'string' &&
    typeof registration.primary_email === 'string' &&
    typeof registration.created_at === 'string' &&
    typeof registration.completed === 'boolean' &&
    typeof registration.last_modified === 'string' &&
    registration.registration_data !== undefined
  );
}

export type { SessionData };
