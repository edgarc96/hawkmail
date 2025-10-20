import { db } from '@/db/index';
import { subscriptions, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import Stripe from 'stripe';

export interface SubscriptionData {
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  priceId: string;
  planType: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
}

export async function createOrUpdateSubscription(data: SubscriptionData) {
  try {
    // Check if subscription already exists
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          status: data.status,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          trialStart: data.trialStart,
          trialEnd: data.trialEnd,
          canceledAt: data.canceledAt,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, data.stripeSubscriptionId));
      
      console.log(`Subscription updated: ${data.stripeSubscriptionId}`);
    } else {
      // Create new subscription
      await db.insert(subscriptions).values({
        userId: data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status,
        priceId: data.priceId,
        planType: data.planType,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        canceledAt: data.canceledAt,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Subscription created: ${data.stripeSubscriptionId}`);
    }
  } catch (error) {
    console.error('Error creating/updating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(stripeSubscriptionId: string, canceledAt?: Date) {
  try {
    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        canceledAt: canceledAt || new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    
    console.log(`Subscription canceled: ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const userSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    
    return userSubscription[0] || null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

export async function isUserPremium(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) return false;
    
    return subscription.status === 'active' || subscription.status === 'trialing';
  } catch (error) {
    console.error('Error checking user premium status:', error);
    return false;
  }
}

export function getPlanTypeFromPriceId(priceId: string): string {
  // Extract plan type from price ID or use a mapping
  // This should match your Stripe price IDs
  if (priceId.includes('basic')) return 'basic';
  if (priceId.includes('pro')) return 'pro';
  if (priceId.includes('enterprise')) return 'enterprise';
  
  // Default fallback
  return 'basic';
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.stripeCustomerId, stripeCustomerId))
      .limit(1);
    
    return users[0] || null;
  } catch (error) {
    console.error('Error finding user by Stripe customer ID:', error);
    throw error;
  }
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  try {
    await db
      .update(user)
      .set({
        stripeCustomerId,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
    
    console.log(`User ${userId} updated with Stripe customer ID: ${stripeCustomerId}`);
  } catch (error) {
    console.error('Error updating user Stripe customer ID:', error);
    throw error;
  }
}