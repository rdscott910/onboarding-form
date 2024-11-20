import 'dotenv/config';
import { sendEmail } from '../../lib/sendgrid-client';

//////////////////////////////////////////////////////

// TODO: Create templates for order confirmation and subscription confirmation
// export async function sendOrderConfirmation(email: string, orderData: any) {
//   return sendEmail({
//     to: email,
//     templateId: process.env.SENDGRID_TEMPLATE_ID_ORDER_CONFIRMATION as string,
//     dynamicTemplateData: {
//       orderNumber: orderData.orderNumber,
//       items: orderData.items,
//       total: orderData.total,
//       // Add any other template variables
//     },
//     subject: `Order Confirmation #${orderData.orderNumber}`,
//   });
// }

// export async function sendSubscriptionConfirmation(email: string, subscriptionData: any) {
//   return sendEmail({
//     to: email,
//     templateId: process.env.SENDGRID_TEMPLATE_ID_SUBSCRIPTION_CONFIRMATION as string,
//     dynamicTemplateData: {
//       planName: subscriptionData.planName,
//       startDate: subscriptionData.startDate,
//       // Add any other template variables
//     },
//     subject: 'Subscription Confirmation',
//   });
// }

//////////////////////////////////////////////////////

export async function sendOrderConfirmation(email: string, orderData: any) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Order Confirmation #${orderData.orderNumber}</h1>
      <p>Thank you for your order!</p>
      
      <h2>Order Details:</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Item</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Quantity</th>
          <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Price</th>
        </tr>
        ${orderData.items
          .map(
            (item: { name: string; quantity: number; price: number }) => `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd;">${item.name}</td>
            <td style="padding: 12px; border: 1px solid #ddd;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">${item.price.toFixed(2)}</td>
          </tr>
        `
          )
          .join('')}
      </table>
      
      <div style="margin-top: 20px; text-align: right;">
        <strong>Total: $${orderData.total.toFixed(2)}</strong>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmation #${orderData.orderNumber}`,
    html: htmlContent,
  });
}

export async function sendSubscriptionConfirmation(email: string, subscriptionData: any) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Subscription Confirmation</h1>
      <p>Thank you for subscribing!</p>
      
      <h2>Subscription Details:</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Plan:</strong> ${subscriptionData.planName}</p>
        <p><strong>Start Date:</strong> ${subscriptionData.startDate}</p>
      </div>
      
      <div style="margin-top: 20px;">
        <p>Welcome to your new subscription! We're excited to have you on board.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Subscription Confirmation',
    html: htmlContent,
  });
}
