import 'dotenv/config';
import sgMail from '@sendgrid/mail';
import { Client } from '@sendgrid/client';

const client = new Client();
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL as string;
// Verify API key is loaded
if (!SENDGRID_API_KEY?.startsWith('SG.')) {
  throw new Error('Invalid SendGrid API key format');
}
console.log(SENDGRID_API_KEY, SENDGRID_FROM_EMAIL);
if (!SENDGRID_FROM_EMAIL) {
  throw new Error('SENDGRID_FROM_EMAIL is required');
}

sgMail.setApiKey(SENDGRID_API_KEY);
client.setApiKey(SENDGRID_API_KEY);

export interface EmailLog {
  recipient: string;
  emailType: string;
  metadata: any;
  sendgridId?: string;
  status: string;
  sentAt?: Date;
}

// TODO: Create templates for order confirmation and subscription confirmation
// export interface SendEmailParams {
//   to: string;
//   templateId: string;
//   dynamicTemplateData: Record<string, any>;
//   subject?: string;
// }
export interface SendEmailParams {
  to: string;
  html: string; // support html content instead of template
  subject: string;
}

export async function sendEmail({ to, html, subject }: SendEmailParams) {
  try {
    const msg = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      html,
    };

    const [response] = await sgMail.send(msg);

    // TODO: Log successful attempt

    return {
      success: true,
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode,
    };
  } catch (error) {
    console.error('SendGrid Error:', error);

    // TODO: Log failed attempt

    throw error;
  }
}

// async function logEmailAttempt(log: EmailLog) {
//   const { data, error } = await supabase.from('email_logs').insert([
//     {
//       recipient: log.recipient,
//       email_type: log.emailType,
//       metadata: log.metadata,
//       sendgrid_id: log.sendgridId,
//       status: log.status,
//       sent_at: log.sentAt,
//     },
//   ]);

//   if (error) {
//     console.error('Error logging email attempt:', error);
//   }

//   return data;
// }
