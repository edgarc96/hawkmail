import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import {
  createOrUpdateSubscription,
  cancelSubscription,
  findUserByStripeCustomerId,
  updateUserStripeCustomerId,
  getPlanTypeFromPriceId
} from '@/lib/subscription-helpers';
import { db } from '@/db/index';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmailNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription trial will end: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        
        const userData = await findUserByStripeCustomerId(subscription.customer as string);
        if (userData) {
          await sendEmailNotification({
            to: userData.email,
            subject: 'Your trial is ending soon!',
            body: `Hi ${userData.name}, your trial for HawkMail is ending in 3 days. Please upgrade to a paid plan to continue using our service.`
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        
        try {
          await cancelSubscription(
            subscription.id,
            subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined
          );
        } catch (error) {
          console.error('Error handling subscription deletion:', error);
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription created: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        
        try {
          // Find user by Stripe customer ID
          const userData = await findUserByStripeCustomerId(subscription.customer as string);
          
          if (!userData) {
            console.error(`No user found for Stripe customer ID: ${subscription.customer}`);
            break;
          }
          
          // Get plan type from price ID
          const planType = getPlanTypeFromPriceId(subscription.items.data[0].price.id);
          
          // Create or update subscription
          const sub = subscription as any;
          await createOrUpdateSubscription({
            userId: userData.id,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            status: sub.status,
            priceId: sub.items.data[0].price.id,
            planType,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        } catch (error) {
          console.error('Error handling subscription creation:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);
        console.log(`Status: ${subscription.status}`);
        
        try {
          // Find user by Stripe customer ID
          const userData = await findUserByStripeCustomerId(subscription.customer as string);
          
          if (!userData) {
            console.error(`No user found for Stripe customer ID: ${subscription.customer}`);
            break;
          }
          
          // Get plan type from price ID
          const planType = getPlanTypeFromPriceId(subscription.items.data[0].price.id);
          
          // Update subscription
          const sub = subscription as any;
          await createOrUpdateSubscription({
            userId: userData.id,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer as string,
            status: sub.status,
            priceId: sub.items.data[0].price.id,
            planType,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : undefined,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        } catch (error) {
          console.error('Error handling subscription update:', error);
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed: ${session.id}`);
        
        try {
          if (session.customer && session.metadata?.userId) {
            // Update user with Stripe customer ID
            await updateUserStripeCustomerId(
              session.metadata.userId,
              session.customer as string
            );
            
            console.log(`User ${session.metadata.userId} linked to Stripe customer ${session.customer}`);
          }
        } catch (error) {
          console.error('Error handling checkout completion:', error);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        
        // If this is a subscription invoice, the subscription will be updated
        // by the customer.subscription.updated event
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
        
        const subscriptionId = invoice.subscription as string;
        if (subscriptionId) {
          await db.update(user).set({
            status: 'past_due'
          }).where(eq(user.stripeSubscriptionId, subscriptionId));

          const userData = await findUserByStripeCustomerId(invoice.customer as string);
          if (userData) {
            await sendEmailNotification({
              to: userData.email,
              subject: 'Your payment failed',
              body: `Hi ${userData.name}, we were unable to process your payment for your HawkMail subscription. Please update your payment information to avoid service interruption.`
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Error processing webhook:`, err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs';
