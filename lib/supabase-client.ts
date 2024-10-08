import { createClient } from '@supabase/supabase-js';
import { FullUserData } from './types';

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function deepCleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(deepCleanUndefined).filter((v) => v !== undefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, deepCleanUndefined(v)])
        .filter(([_, v]) => v !== undefined)
    );
  }
  return obj;
}

export async function insertUserDataToSupabase(userData: FullUserData) {
  try {
    // Deep clean the data, removing undefined values at all levels
    const cleanedData = deepCleanUndefined(userData);

    // Insert the data into the 'locations' table
    const { data, error } = await supabase.from('locations').insert([cleanedData]).select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting data into Supabase:', error);
    throw error;
  }
}
