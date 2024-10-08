import { Twilio } from 'twilio';

// Define types for Twilio responses
interface TwilioAvailableNumber {
  phoneNumber: string;
}

interface TwilioIncomingPhoneNumber {
  phoneNumber: string;
}

// Assuming these are defined elsewhere in your application
const TWILIO_VOICE_WEBHOOK_URL: string = process.env.TWILIO_VOICE_WEBHOOK_URL || 'https://phone-1r5q.onrender.com/incoming';
const TWILIO_MESSAGING_SERVICE_SID: string = process.env.TWILIO_MESSAGING_SERVICE_SID || 'MGc18b4b77846960e86aa58224ee21f958';
const twilioClient: Twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function deployTwilioNumber(restaurantName: string, streetAddr: string): Promise<string> {
  try {
    const availableNumbers: TwilioAvailableNumber[] = await twilioClient.availablePhoneNumbers('US').local.list({ limit: 1 });

    if (availableNumbers.length === 0) {
      throw new Error('No available Twilio numbers');
    }

    // Format the friendly name
    const streetWithoutNumbers = streetAddr.replace(/\d+/g, '').trim();
    const friendlyName = `${restaurantName} ${streetWithoutNumbers}`.trim();

    const newNumber: TwilioIncomingPhoneNumber = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: availableNumbers[0].phoneNumber,
      friendlyName: friendlyName,
      voiceUrl: TWILIO_VOICE_WEBHOOK_URL,
      voiceMethod: 'POST',
      smsApplicationSid: TWILIO_MESSAGING_SERVICE_SID,
    });

    console.log(`Deployed new Twilio number: ${newNumber.phoneNumber} with friendly name: ${friendlyName}`);
    console.log(`Voice webhook set to: ${TWILIO_VOICE_WEBHOOK_URL}`);
    console.log(`Messaging service SID set to: ${TWILIO_MESSAGING_SERVICE_SID}`);

    return newNumber.phoneNumber;
  } catch (error) {
    console.error('Error deploying Twilio number:', error);
    throw error;
  }
}

export default deployTwilioNumber;
