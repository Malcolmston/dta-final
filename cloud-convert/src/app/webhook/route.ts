// Stripe webhook handler for processing payment events

import { NextRequest, NextResponse } from 'next/server';
import { stripe, webhookSecret } from '@/lib/stripe';
import { initializeDatabase, AppDataSource } from '@/lib/database';
import { User } from '@/entities/User';
import { Subscription, SubscriptionType, SubscriptionStatus } from '@/entities/Subscription';
import { getProduct, getSubscriptionType } from '@/lib/products';
import { grantSubscriptionTokens } from '@/lib/tokenActions';

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No signature found');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: any;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      console.log('✅ Webhook secret found, verifying signature...');
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      console.warn('⚠️  No webhook secret, skipping verification');
      event = JSON.parse(body);
    }

    console.log(`✅ Webhook verified - Event type: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed:', event.data.object.id);
        break;

      case 'customer.subscription.created':
        console.log('🆕 Subscription created:', event.data.object.id);
        break;

      case 'customer.subscription.updated':
        console.log('📝 Subscription updated:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`❌ Error processing webhook: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('💳 Payment succeeded:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  console.log('📦 Payment metadata:', metadata);

  if (!metadata.userId || !metadata.productId) {
    console.error('❌ Missing metadata (userId or productId)');
    return;
  }

  const userId = parseInt(metadata.userId);
  const productId = metadata.productId;
  const productName = metadata.productName || 'Unknown Product';

  // Get product details
  const product = getProduct(productId);
  if (!product) {
    console.error(`❌ Product not found: ${productId}`);
    return;
  }

  try {
    // Initialize database
    console.log('🔌 Initializing database connection...');
    await initializeDatabase();

    const userRepo = AppDataSource.getRepository(User);
    const subscriptionRepo = AppDataSource.getRepository(Subscription);

    // Find user
    console.log(`🔍 Looking for user with ID: ${userId}`);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return;
    }

    console.log(`✅ User found: ${user.email}`);

    // Get subscription type
    const subscriptionType = getSubscriptionType(productId);
    console.log(`📋 Subscription type: ${subscriptionType}`);

    // Create subscription record
    console.log('💾 Creating subscription record...');
    const subscription = subscriptionRepo.create({
      userId: user.id,
      productId,
      productName,
      subscriptionType,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      amount: product.price,
      currency: product.currency,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      autoRenew: true,
      stripePaymentIntentId: paymentIntent.id,
    });

    await subscriptionRepo.save(subscription);
    console.log(`✅ Subscription record created with ID: ${subscription.id}`);

    // Update user with Stripe customer ID if available
    if (paymentIntent.customer && !user.stripeCustomerId) {
      console.log('💾 Updating user with Stripe customer ID...');
      user.stripeCustomerId = paymentIntent.customer;
      await userRepo.save(user);
      console.log('✅ User updated');
    }

    // Grant tokens based on product
    console.log(`🎟️  Granting ${product.tokens} tokens to user...`);
    await grantSubscriptionTokens(userId, product.tokens);

    console.log(`🎉 SUCCESS: Subscription created for user ${userId}: ${subscriptionType}`);
  } catch (error: any) {
    console.error(`❌ Error creating subscription: ${error.message}`);
    throw error;
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  console.log('🚫 Subscription cancelled:', subscription.id);

  try {
    await initializeDatabase();
    const subscriptionRepo = AppDataSource.getRepository(Subscription);

    // Find subscription by Stripe ID
    const sub = await subscriptionRepo.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (sub) {
      sub.subscriptionStatus = SubscriptionStatus.CANCELLED;
      sub.cancelledAt = new Date();
      sub.autoRenew = false;

      await subscriptionRepo.save(sub);
      console.log(`✅ Subscription ${sub.id} marked as cancelled`);
    }
  } catch (error: any) {
    console.error(`❌ Error cancelling subscription: ${error.message}`);
  }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
