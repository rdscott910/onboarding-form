import { createClient } from '@supabase/supabase-js';
import { FullLocationData, RestaurantHours, PartialServerStoreData, AnonymousRegistration } from '@/lib/types/types';
import { Database } from '@/lib/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase configuration');
}

// Enhanced client configuration with proper auth settings
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true, // Ensures token stays valid
    persistSession: true, // Maintains session across page reloads
    detectSessionInUrl: false, // Disable URL detection since we're not using redirects
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js', // Helps with debugging and tracking
    },
  },
});

export async function getOrCreateRegistration(
  primary_email: string,
  initialData?: PartialServerStoreData
): Promise<AnonymousRegistration | null> {
  try {
    // Check for valid auth session before database operations
    const session = await supabaseClient.auth.getSession();
    if (!session.data.session) {
      console.error('No auth session found');
      return null;
    }

    // Try to fetch existing registration
    const { data, error: fetchError } = await supabaseClient
      .from('anonymous_registrations')
      .select()
      .eq('primary_email', primary_email)
      .single();

    // Handle case where registration doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new registration and return full record
      const { data: newReg, error: insertError } = await supabaseClient
        .from('anonymous_registrations')
        .insert({
          primary_email,
          registration_data: initialData,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newReg;
    }

    // Re-throw any other errors for proper handling
    if (fetchError) throw fetchError;
    return data;
  } catch (error) {
    console.error('Registration error:', error);
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

/**
 * Type guard for checking if an unknown value matches AnonymousRegistration
 */
export function isAnonymousRegistration(obj: unknown): obj is AnonymousRegistration {
  if (!obj || typeof obj !== 'object') return false;

  const registration = obj as AnonymousRegistration;
  return (
    typeof registration.id === 'string' &&
    typeof registration.created_at === 'string' &&
    typeof registration.primary_email === 'string' &&
    typeof registration.registration_data === 'object' &&
    typeof registration.completed === 'boolean' &&
    typeof registration.last_modified === 'string'
  );
}
