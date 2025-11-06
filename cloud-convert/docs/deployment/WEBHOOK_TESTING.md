# Stripe Webhook Testing Guide

## Quick Setup

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login
```

### 2. Get Your Webhook Secret

#### Option A: Using Stripe CLI (Development - Recommended)

```bash
# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/webhook

# This will output something like:
# > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy the `whsec_xxxxxxxxxxxxx` value and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### Option B: Using Stripe Dashboard (Production)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the "Signing secret" and add to your `.env.local`

### 3. Test the Webhook

#### Start Your App

```bash
# With Docker
docker-compose up

# Or locally
npm run dev
```

#### Trigger Test Events with Stripe CLI

```bash
# In a separate terminal, forward webhooks
stripe listen --forward-to localhost:3000/webhook

# In another terminal, trigger a payment
stripe trigger payment_intent.succeeded
```

### 4. Watch the Logs

You should see detailed logs in your app console:

```
🔔 Webhook received
✅ Webhook secret found, verifying signature...
✅ Webhook verified - Event type: payment_intent.succeeded
💳 Payment succeeded: pi_xxxxx
📦 Payment metadata: { userId: '1', productId: 'basic', productName: 'Basic Plan', customerId: 'cus_xxxxx' }
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

## Testing Real Payments

### Test Card Numbers

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

Use any future expiry date (e.g., `12/34`) and any 3-digit CVC.

### Make a Test Purchase

1. Go to `http://localhost:3000/products`
2. Click "Subscribe" on any plan
3. Enter test card: `4242 4242 4242 4242`
4. Complete the payment
5. Check your app logs for webhook events
6. Verify database was updated:

```bash
# Connect to database
mysql -h localhost -u root -p"Malcolm@1008" file_convert

# Check subscriptions
SELECT * FROM subscriptions ORDER BY createdAt DESC LIMIT 5;
```

## Troubleshooting

### "Missing STRIPE_WEBHOOK_SECRET"

**Problem:** Webhook returns 500 error

**Solution:**
1. Make sure `.env.local` has `STRIPE_WEBHOOK_SECRET`
2. Restart your dev server or Docker containers

### "Webhook signature verification failed"

**Problem:** Error: `No signatures found matching the expected signature`

**Solution:**
1. Make sure you're using the correct webhook secret
2. For local testing, use the secret from `stripe listen`
3. For production, use the secret from Stripe Dashboard

### "User not found"

**Problem:** Logs show: `❌ User not found: undefined`

**Solution:**
1. Check that payment intent metadata includes `userId`
2. Verify user exists in database with that ID

### No Logs Appearing

**Problem:** Webhook endpoint not being called

**Solution:**
1. Verify Stripe CLI is forwarding: `stripe listen --forward-to localhost:3000/webhook`
2. Check that your app is running on port 3000
3. Verify the webhook route exists at `/webhook`

## Database Verification

After a successful payment, verify the data:

```sql
-- Check latest subscription
SELECT
    s.id,
    s.userId,
    u.email,
    s.subscriptionType,
    s.subscriptionStatus,
    s.amount / 100 as price,
    s.startDate,
    s.endDate,
    s.stripePaymentIntentId
FROM subscriptions s
JOIN users u ON s.userId = u.id
ORDER BY s.createdAt DESC
LIMIT 1;
```

## Production Checklist

Before deploying to production:

- [ ] Add webhook endpoint in Stripe Dashboard
- [ ] Use production webhook secret in `.env`
- [ ] Test with real test mode payments
- [ ] Verify SSL certificate is valid
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Set up retry logic for failed webhooks
- [ ] Add alerting for webhook failures

## Useful Commands

```bash
# Listen for webhooks (development)
stripe listen --forward-to localhost:3000/webhook

# Trigger specific events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger customer.subscription.deleted

# View webhook logs
stripe logs tail

# Test webhook signature locally
curl -X POST http://localhost:3000/webhook \
  -H "stripe-signature: xxx" \
  -d @webhook-payload.json
```
