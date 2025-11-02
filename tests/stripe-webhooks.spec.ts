import { POST } from '@/app/api/stripe/webhook/route';
import { stripe } from '@/lib/stripe';
import * as subscriptionHelpers from '@/lib/subscription-helpers';
import * as notifications from '@/lib/notifications';
import { NextRequest } from 'next/server';
import { db } from '@/db/index';

// Mock the dependencies
jest.mock('@/lib/stripe');
jest.mock('@/lib/subscription-helpers');
jest.mock('@/lib/notifications');
jest.mock('@/db/index');

describe('Stripe Webhook Handler', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock NextRequest
    mockRequest = {
      headers: new Headers({ 'stripe-signature': 'test_signature' }),
      text: jest.fn().mockResolvedValue('test_body'),
    } as unknown as NextRequest;

    // Mock stripe.webhooks.constructEvent
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: '',
      data: { object: {} },
    });
  });

  it('should handle customer.subscription.trial_will_end', async () => {
    // Arrange
    const mockSubscription = {
      id: 'sub_123',
      status: 'trialing',
      customer: 'cus_123',
    };
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.trial_will_end',
      data: { object: mockSubscription },
    });
    (subscriptionHelpers.findUserByStripeCustomerId as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    });

    // Act
    await POST(mockRequest);

    // Assert
    expect(subscriptionHelpers.findUserByStripeCustomerId).toHaveBeenCalledWith('cus_123');
    expect(notifications.sendEmailNotification).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Your trial is ending soon!',
      body: 'Hi Test User, your trial for HawkMail is ending in 3 days. Please upgrade to a paid plan to continue using our service.',
    });
  });

  it('should handle invoice.payment_failed', async () => {
    // Arrange
    const mockInvoice = {
      id: 'in_123',
      customer: 'cus_123',
      subscription: 'sub_123',
    };
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'invoice.payment_failed',
      data: { object: mockInvoice },
    });
    (subscriptionHelpers.findUserByStripeCustomerId as jest.Mock).mockResolvedValue({
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    });

    // Mock the db.update call
    const mockUpdate = jest.fn().mockReturnThis();
    const mockWhere = jest.fn();
    (db.update as jest.Mock).mockReturnValue({ set: mockUpdate, where: mockWhere });


    // Act
    await POST(mockRequest);

    // Assert
    expect(subscriptionHelpers.findUserByStripeCustomerId).toHaveBeenCalledWith('cus_123');
    expect(notifications.sendEmailNotification).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Your payment failed',
      body: 'Hi Test User, we were unable to process your payment for your HawkMail subscription. Please update your payment information to avoid service interruption.',
    });
  });
});
