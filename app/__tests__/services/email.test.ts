import 'dotenv/config';
import { sendOrderConfirmation } from '@/app/services/email-service';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface TestOrder {
  orderNumber: string;
  items: OrderItem[];
  total: number;
}

describe('Email Service Tests', () => {
  beforeAll(() => {
    // Ensure environment variables are loaded
    process.env.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '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';
    process.env.SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'test@example.com';
  });

  test('should send order confirmation email successfully', async () => {
    const testOrder: TestOrder = {
      orderNumber: 'TEST-001',
      items: [
        {
          name: 'Test Item',
          quantity: 1,
          price: 10.0,
        },
      ],
      total: 10.0,
    };

    const result = await sendOrderConfirmation('rscott.trutech@gmail.com', testOrder);

    expect(result).toBeDefined();
  });
});
