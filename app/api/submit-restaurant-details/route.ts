import { NextRequest, NextResponse } from 'next/server';
// import serverStore from '@/lib/server-store';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseAnonKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'street_address', 'contact_number', 'contact_email', 'city_address', 'state_address', 'zip_address'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // TODO: Insert form data into Supabase PostgreSQL database
    // This is where you would insert the form data into your Supabase database
    // Example:
    const { data, error } = await supabase.from('locations').insert(formData);

    if (error) {
      console.error('Error inserting data into Supabase:', error);
      return NextResponse.json({ error: 'Failed to save restaurant details' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error processing restaurant details:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
  }
}
