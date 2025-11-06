# Stripe Webhook Setup Guide

## Overview
This application uses Stripe webhooks to automatically update user subscriptions in the database when payments are processed.

## Webhook Events Handled

1. **payment_intent.succeeded** - Updates user subscription when payment completes
2. **payment_intent.payment_failed** - Logs failed payments
3. **customer.subscription.created** - Syncs new subscriptions
4. **customer.subscription.updated** - Updates subscription changes
5. **customer.subscription.deleted** - Handles cancellations

## Setup Instructions

### 1. Add Webhook Secret to Environment Variables

Add this to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Set Up Webhook in Stripe Dashboard

#### For Development (Local Testing):

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/webhook
   ```

4. Copy the webhook signing secret from the output:
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. Add it to your `.env` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

#### For Production:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)

2. Click "Add endpoint"

3. Set endpoint URL:
   ```
   https://yourdomain.com/webhook
   ```

4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Copy the signing secret and add to your production `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_prod_xxxxx
   ```

### 3. Test the Webhook

#### Using Stripe CLI:

```bash
# Trigger a test payment intent
stripe trigger payment_intent.succeeded
```

#### Using Stripe Dashboard:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `payment_intent.succeeded`
5. Send the test event

### 4. Verify Database Updates

After a successful payment, check that the user record was updated:

```sql
SELECT
    id,
    email,
    subscriptionType,
    subscriptionStatus,
    stripeCustomerId,
    subscriptionStartDate,
    subscriptionEndDate
FROM users
WHERE id = YOUR_USER_ID;
```

## What Happens When Payment Succeeds

1. **Webhook receives** `payment_intent.succeeded` event
2. **Extracts metadata**: userId, productId, customerId
3. **Finds user** in database by userId
4. **Maps product** to subscription type (BASIC, PRO, etc.)
5. **Updates user record**:
   - `subscriptionType` → Based on purchased product
   - `subscriptionStatus` → ACTIVE
   - `stripeCustomerId` → Stripe customer ID
   - `subscriptionStartDate` → Current date
   - `subscriptionEndDate` → 30 days from now
6. **Logs success** to console

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
- Is `STRIPE_WEBHOOK_SECRET` set correctly?
- Is the webhook endpoint accessible?
- Are you forwarding events with Stripe CLI in development?

**Test connectivity:**
```bash
curl -X POST http://localhost:3000/webhook
```

### Signature Verification Failing

**Common causes:**
- Wrong `STRIPE_WEBHOOK_SECRET`
- Request body was modified before reaching webhook handler
- Using test secret in production or vice versa

**Solution:**
- Verify you're using the correct secret for your environment
- Ensure raw request body is preserved

### User Not Found

**Check:**
- Is userId in payment intent metadata?
- Does the user exist in database?
- Is userId numeric?

**Debug:**
```javascript
console.log('Payment metadata:', paymentIntent.metadata)
```

### Subscription Type Not Updating

**Check:**
- Is productId in metadata?
- Is productId mapped in `getSubscriptionTypeFromProductId()`?

**Valid product IDs:**
- `basic` → BASIC
- `pro` → PRO
- `enterprise` → ENTERPRISE
- `api-starter` → API_STARTER
- `api-professional` → API_PROFESSIONAL
- `api-enterprise` → API_ENTERPRISE

## Monitoring Webhooks

### View Webhook Logs in Stripe Dashboard

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. View "Logs" tab to see all events

### Application Logs

The webhook handler logs important events:

```
✅ User 123 subscription updated to PRO
✅ Subscription sub_xxx updated for user 123
✅ Subscription cancelled for user 123
```

### Failed Events

Stripe will retry failed webhooks automatically with exponential backoff.

## Security Notes

- ✅ Webhook signature verification is enabled
- ✅ Only permitted events are processed
- ✅ Database updates are wrapped in try-catch
- ✅ User validation before updates
- ⚠️ Keep `STRIPE_WEBHOOK_SECRET` secure
- ⚠️ Never commit secrets to version control

## Next Steps

After setup:
1. Run database migration to add subscription fields
2. Test with a real payment in test mode
3. Verify user subscription updated in database
4. Deploy to production
5. Update webhook URL in Stripe Dashboard
6. Test production webhook
