# Subscription Features Documentation

## Overview

This document outlines the subscription management system including the account dashboard, metered billing for teams, and Stripe webhook integration.

## 1. Account Tab with Subscription Display

### Location
`/dashboard` → Account Tab

### Features

#### Subscription Information Card
- **Visual Status Indicators**: Color-coded badges for subscription type and status
- **Plan Details**: Shows product name, price, and billing cycle
- **Dates**: Start date and next billing date
- **Auto-renewal Status**: Indicates if subscription will auto-renew

#### Status Badges
- **ACTIVE**: Green badge - Subscription is currently active
- **CANCELLED**: Red badge - Subscription has been cancelled
- **EXPIRED**: Gray badge - Subscription has ended
- **TRIAL**: Blue badge - Free trial period

#### Plan Type Badges
- **FREE**: Gray - No paid subscription
- **BASIC**: Blue - Basic user plan ($9.99/month)
- **PRO**: Purple - Pro user plan ($19.99/month)
- **ENTERPRISE**: Indigo - Enterprise plan ($49.99/month)
- **API_STARTER**: Cyan - API Starter ($29.99/month)
- **API_PROFESSIONAL**: Teal - API Professional ($99.99/month)
- **API_ENTERPRISE**: Emerald - API Enterprise ($299.99/month)

#### Actions
- **No Subscription**: "View Plans" button redirects to `/products`
- **Active Subscription**: "Upgrade Plan" button to change subscription tier

### API Endpoint

**GET** `/api/dashboard/subscription`

Returns the user's latest active subscription:

```json
{
  "subscription": {
    "id": 1,
    "subscriptionType": "PRO",
    "subscriptionStatus": "ACTIVE",
    "productName": "Pro Plan",
    "amount": 1999,
    "currency": "usd",
    "startDate": "2025-11-01T00:00:00.000Z",
    "endDate": "2025-12-01T00:00:00.000Z",
    "autoRenew": true,
    "cancelledAt": null
  }
}
```

## 2. Metered Billing for Teams

### Team Metered Plan

**Product ID**: `team-metered`

**Base Price**: $49.99/month

**Limits**:
- **Maximum Team Members**: 5 seats
- **Included Conversions**: 10,000 per month
- **Overage Billing**: Pay per additional conversion beyond limit

### Features
- Up to 5 team members
- 10,000 conversions/month included
- Pay per additional conversion
- All conversion endpoints
- Rate limit: 300 req/min
- Priority support
- Team management dashboard

### Implementation

The metered billing product is defined in `/src/lib/products.ts`:

```typescript
'team-metered': {
    id: 'team-metered',
    name: 'Team Metered',
    description: 'Pay per use for teams',
    price: 4999, // $49.99 base
    currency: 'usd',
    userType: 'developer',
    metered: true,
    unitLimit: 10000,
    maxSeats: 5,
    features: [...]
}
```

### Usage Tracking

Use the `getProductLimits()` function to check limits:

```typescript
import { getProductLimits } from '@/lib/products';

const limits = getProductLimits('team-metered');
console.log(limits);
// { conversions: 10000, seats: 5 }
```

## 3. Stripe Integration in Docker

### Docker Compose Setup

The `docker-compose.yml` now includes a Stripe CLI container that automatically forwards webhook events to your application.

```yaml
stripe-cli:
  image: stripe/stripe-cli:latest
  container_name: cloud-convert-stripe-cli
  command: listen --api-key ${STRIPE_SECRET_KEY} --forward-to app:3000/webhook
  env_file:
    - .env.stripe
  depends_on:
    - app
  networks:
    - app_network
  restart: unless-stopped
```

### How It Works

1. **Automatic Webhook Forwarding**: The Stripe CLI container automatically listens for Stripe events and forwards them to your app
2. **No Manual Setup Required**: When you run `docker-compose up`, webhooks are automatically configured
3. **Real-time Testing**: Test payments in Stripe dashboard and see immediate webhook events

### Environment Variables

Ensure `.env.stripe` contains:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

And `.env.local` contains:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Viewing Webhook Logs

```bash
# View Stripe CLI logs
docker logs -f cloud-convert-stripe-cli

# View application webhook logs
docker logs -f cloud-convert-app
```

## 4. Webhook Enhancements

### Comprehensive Logging

The webhook handler now includes detailed logging for debugging:

```
🔔 Webhook received
✅ Webhook secret found, verifying signature...
✅ Webhook verified - Event type: payment_intent.succeeded
💳 Payment succeeded: pi_xxxxx
📦 Payment metadata: { userId: '1', productId: 'basic', productName: 'Basic Plan' }
🔌 Initializing database connection...
✅ Database connected
🔍 Looking for user with ID: 1
✅ User found: user@example.com
📋 Subscription type: BASIC
💾 Creating subscription record...
✅ Subscription record created with ID: 1
💾 Updating user with Stripe customer ID...
✅ User updated
🎉 SUCCESS: Subscription created for user 1: BASIC
```

### Handled Events

- `payment_intent.succeeded` - Creates subscription record
- `payment_intent.payment_failed` - Logs failure
- `customer.subscription.created` - Logs creation
- `customer.subscription.updated` - Logs update
- `customer.subscription.deleted` - Marks subscription as cancelled

## 5. Testing the System

### Step 1: Start Docker

```bash
docker-compose up
```

This automatically:
- Runs database migrations
- Starts the app
- Starts Stripe webhook forwarding

### Step 2: Make a Test Purchase

1. Go to `http://localhost:3000/products`
2. Choose a plan (e.g., Basic Plan)
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout

### Step 3: Verify Subscription

1. Go to `http://localhost:3000/dashboard`
2. Click on "Account" tab
3. You should see your subscription details with:
   - Plan name and price
   - Status badge
   - Start and billing dates
   - Upgrade button

### Step 4: Check Database

```sql
SELECT
    s.id,
    u.email,
    s.subscriptionType,
    s.subscriptionStatus,
    s.productName,
    s.amount / 100 as price,
    s.startDate,
    s.endDate
FROM subscriptions s
JOIN users u ON s.userId = u.id
ORDER BY s.createdAt DESC
LIMIT 5;
```

## 6. Future Enhancements

### Team Management
- Invite team members
- Manage seats
- View team usage

### Usage Tracking
- Track API conversions
- Monitor usage against limits
- Alert when approaching limits

### Metered Billing Implementation
- Report usage to Stripe
- Calculate overage charges
- Generate usage reports

### Subscription Management
- Cancel subscription
- Upgrade/downgrade plans
- Update payment method
- View billing history

## 7. Troubleshooting

### Subscription Not Showing

1. **Check webhook logs**: `docker logs -f cloud-convert-stripe-cli`
2. **Verify webhook secret** in `.env.local`
3. **Check database**: Query subscriptions table
4. **Look for errors** in app logs

### Stripe CLI Not Working

1. **Restart container**: `docker-compose restart stripe-cli`
2. **Check API key** in `.env.stripe`
3. **View logs**: `docker logs cloud-convert-stripe-cli`

### Database Not Updated

1. **Check webhook handler logs** for errors
2. **Verify migrations ran**: Look for migration container logs
3. **Test database connection** manually
4. **Check user ID** in payment metadata

## Summary

The subscription system now provides:
- ✅ **Visual subscription display** in Account tab
- ✅ **Metered billing option** for teams (5 seats, 10k conversions)
- ✅ **Automated webhook forwarding** via Docker
- ✅ **Comprehensive logging** for debugging
- ✅ **Real-time subscription updates** from Stripe

Users can now easily see their subscription status, and the system automatically tracks all purchases through Stripe webhooks!
