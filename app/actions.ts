import { getOrCreateRegistration, updateRegistrationData, getRegistrationData } from '@/lib/supabase-client';
import { ExtendedPartialServerStoreData } from '@/lib/types/types';
import { hasRequiredEmail } from '@/lib/types/types';

export async function submitRootForm(formData: ExtendedPartialServerStoreData) {
  if (!hasRequiredEmail(formData)) {
    throw new Error('Email is required to start registration process');
  }

  const session = await getOrCreateRegistration(formData.primary_email, formData);

  if (!session) {
    throw new Error('Failed to start registration process');
  }

  return {
    success: true,
    registrationId: session.registrationId,
    primary_email: session.primary_email,
    message: 'Registration process started successfully',
  };
}

export async function updateRestaurantDetails(formData: ExtendedPartialServerStoreData) {
  if (!hasRequiredEmail(formData)) {
    throw new Error('Email is required to update registration');
  }

  const success = await updateRegistrationData(formData.primary_email, formData);

  if (!success) {
    throw new Error('Failed to update registration data');
  }

  const updatedData = await getRegistrationData(formData.primary_email);

  return {
    success: true,
    message: 'Registration data updated successfully',
    registrationData: updatedData,
    primary_email: formData.primary_email,
  };
}
