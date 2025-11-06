# Upgrade & Downgrade Prevention System

## Overview

This system prevents users from downgrading to lower-tier plans and automatically applies prorated credit when upgrading. It also includes automatic invoice generation and a metered billing slider for team plans.

## Features Implemented

### 1. ✅ Downgrade Prevention

Users **cannot** downgrade to a lower-tier plan. Only same-tier switches and upgrades are allowed.

#### How It Works:

- Each product has a `tier` number (1 = lowest, 3 = highest)
- System compares tiers before allowing purchase
- Downgrade attempts are blocked at API level

#### Example Tiers:

**User Plans:**
- Basic: Tier 1 ($9.99)
- Pro: Tier 2 ($19.99)
- Enterprise: Tier 3 ($49.99)

**Developer Plans:**
- API Starter: Tier 1 ($29.99)
- API Professional: Tier 2 ($99.99)
- API Enterprise: Tier 3 ($299.99)
- Team Metered: Tier 2 ($49.99+)

### 2. ✅ Prorated Credit on Upgrades

When users upgrade, they receive credit for unused time on their current plan.

#### Proration Calculation:

```typescript
// Calculate unused portion of current plan
const unusedAmount = (currentPrice * daysRemaining) / daysInPeriod

// Calculate prorated amount for new plan
const proratedNewAmount = (newPrice * daysRemaining) / daysInPeriod

// Credit = unused amount - prorated new amount
const credit = Math.max(0, unusedAmount - proratedNewAmount)

// Final charge
const finalAmount = newPrice - credit
```

#### Example:

**Scenario:**
- Current Plan: Basic ($9.99/month)
- New Plan: Pro ($19.99/month)
- Days Remaining: 15 days

**Calculation:**
```
Unused credit: $9.99 × (15/30) = $5.00
Prorated new cost: $19.99 × (15/30) = $10.00
Total charge: $19.99 - $5.00 = $14.99
```

User pays **$14.99** instead of $19.99!

### 3. ✅ Automatic Invoice Generation

All payments automatically generate invoices with detailed metadata:

#### Invoice Metadata:
- Product ID and name
- User information
- Upgrade status (true/false)
- Prorated credit amount
- Previous plan name
- Payment description

#### Stripe Payment Intent Description Examples:
- `"Basic Plan subscription"` - New subscription
- `"Pro Plan subscription (Upgrade with proration)"` - Upgrade

### 4. ✅ Smart Product Page

The products page now shows:
- **Current Plan** - Green badge, disabled button
- **Downgrades** - Grayed out, "Not Available"
- **Upgrades** - Blue/highlighted, shows "Upgrade" instead of "Choose Plan"

#### UI States:

```tsx
// Current plan
<button disabled className="bg-green-100 text-green-800">
    Current Plan
</button>

// Downgrade (blocked)
<button disabled className="bg-gray-100 text-gray-400">
    Not Available
</button>

// Upgrade available
<button className="bg-blue-600 text-white">
    Upgrade
</button>
```

### 5. ✅ Metered Billing Slider

Special interactive slider for team metered plans with enterprise scaling.

#### Features:
- **Dynamic Pricing**: Adjusts price based on team size
- **Visual Slider**: Gradient slider (5-10,000 team members)
- **Number Input**: Enter exact team size manually
- **Per-Seat Pricing**: Shows cost per seat and total
- **Usage Information**: Displays included conversions and overage rate
- **Purple Theme**: Distinct visual styling for metered plans
- **Enterprise Scale**: Support from 5 to 10,000 seats

#### Pricing Structure:
```
Base: $49.99 for 5 seats (minimum)
Per Seat: $9.998/seat

Minimum: 5 seats = $49.99/month
Example: 10 seats = $99.98/month
Example: 50 seats = $499.90/month
Example: 100 seats = $999.80/month
Maximum: 10,000 seats = $99,980/month

+ 10,000 conversions/month included
+ $0.001 per additional conversion
```

## API Changes

### Payment Intent Creation

**Endpoint:** `POST /api/create-payment-intent`

**New Logic:**
1. Fetch user's current active subscription
2. Validate upgrade/downgrade using `canChangePlan()`
3. Calculate prorated credit if upgrading
4. Create PaymentIntent with adjusted amount
5. Include proration metadata

**Response:**
```json
{
  "clientSecret": "pi_xxx",
  "product": { ... },
  "user": { "name": "...", "email": "..." },
  "proration": {
    "credit": 499,
    "originalPrice": 1999,
    "finalPrice": 1500,
    "previousPlan": "Basic Plan"
  }
}
```

### Subscription Fetch

**Endpoint:** `GET /api/dashboard/subscription`

Returns user's latest active subscription for validation.

## Product Configuration

### Product Interface:

```typescript
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    features?: string[];
    userType?: 'user' | 'developer';
    metered?: boolean;        // NEW
    unitLimit?: number;       // NEW
    maxSeats?: number;        // NEW
    tier?: number;            // NEW
}
```

### Helper Functions:

```typescript
// Check if change is allowed
canChangePlan(currentId, newId): { allowed: boolean; reason?: string }

// Check if it's an upgrade
isUpgrade(currentId, newId): boolean

// Calculate proration
calculateProration(currentPrice, newPrice, daysRemaining): number

// Get usage limits
getProductLimits(productId): { conversions: number; seats: number }
```

## User Flow

### Scenario 1: New Subscription

```
1. User visits /products
2. Selects "Basic Plan"
3. Redirected to /checkout?product=basic
4. Enters payment (4242 4242 4242 4242)
5. Pays $9.99
6. Webhook creates subscription
7. User sees subscription in Account tab
```

### Scenario 2: Upgrade with Proration

```
1. User has "Basic Plan" ($9.99)
2. Visits /products
3. Sees "Pro Plan" with "Upgrade" button
4. Clicks upgrade
5. System calculates:
   - Days remaining: 15
   - Credit: $5.00
   - Final cost: $14.99
6. User pays $14.99 (not $19.99!)
7. Webhook updates subscription
8. Old subscription marked as cancelled
9. New subscription created
```

### Scenario 3: Attempted Downgrade

```
1. User has "Pro Plan" ($19.99)
2. Visits /products
3. Sees "Basic Plan" grayed out
4. Button says "Not Available"
5. Hover shows "Downgrading is not allowed"
6. Cannot proceed with downgrade
```

### Scenario 4: Metered Billing Selection

```
1. Developer visits /products
2. Sees "Team Metered" card with slider and input
3. Options:
   a. Drag slider to desired team size (5-10,000)
   b. Type exact number in input field
4. Example: Enter 50 seats
5. Price updates to $499.90
6. Shows "$9.99 per seat/month"
7. Clicks "Choose Plan"
8. Redirected to /checkout?product=team-metered&seats=50
9. Pays $499.90 for 50 seats
```

## Testing

### Test Upgrade with Proration:

```bash
# 1. Start docker
docker-compose up

# 2. Create user and buy Basic plan
# Visit http://localhost:3000/products
# Card: 4242 4242 4242 4242

# 3. Wait 15 days or manually adjust subscription endDate in DB
mysql -h localhost -u root -p"Malcolm@1008" file_convert
UPDATE subscriptions SET endDate = DATE_ADD(NOW(), INTERVAL 15 DAY) WHERE id = 1;

# 4. Try to upgrade to Pro
# Visit /products and click "Upgrade" on Pro plan
# Should show prorated price

# 5. Check logs for proration calculation
docker logs -f cloud-convert-app | grep "💰"
```

### Test Downgrade Prevention:

```bash
# 1. Have Pro plan
# 2. Visit /products
# 3. Try to click Basic plan
# Should be disabled with "Not Available"

# 4. Try API directly
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"productId":"basic"}'

# Should return: {"error":"Downgrading to a lower plan is not allowed"}
```

### Test Metered Billing Slider:

```
1. Set user role to "developer"
2. Visit /dashboard → Products tab
3. See Team Metered card with slider and input field

# Test Slider:
4. Drag slider from 5 to 100
5. Watch price update: $49.99 → $999.80
6. See gradient fill on slider

# Test Manual Input:
7. Type "500" in number input
8. Price updates to $4,999
9. Slider position adjusts

# Test Limits:
10. Try to enter "3" → Automatically adjusts to minimum (5)
11. Try to enter "20000" → Automatically adjusts to maximum (10,000)

# Complete Purchase:
12. Set to desired amount (e.g., 25 seats)
13. Click "Choose Plan"
14. Should redirect to /checkout?product=team-metered&seats=25
15. Price shown: $249.75
```

## Database Impact

### Subscription Records:

Each upgrade creates a new subscription record:

```sql
-- Old subscription
UPDATE subscriptions
SET subscriptionStatus = 'CANCELLED',
    cancelledAt = NOW()
WHERE id = 1;

-- New subscription
INSERT INTO subscriptions (...) VALUES (...);
```

### Metadata Storage:

All upgrade information is stored in:
- `subscriptions.metadata` - JSON with proration details
- Stripe PaymentIntent metadata
- Stripe Invoice (auto-generated)

## Console Logging

### Proration Logs:

```
💰 Proration calculated:
  Current plan: Basic Plan ($9.99)
  New plan: Pro Plan ($19.99)
  Days remaining: 15
  Credit: $5.00
  Final amount: $14.99
```

### Webhook Logs:

```
💳 Payment succeeded: pi_xxxxx
📦 Payment metadata: { isUpgrade: 'true', proratedCredit: '499', previousPlan: 'Basic Plan' }
💾 Creating subscription record...
✅ Subscription record created with ID: 2
```

## Benefits

1. **User-Friendly**: No accidental downgrades
2. **Fair Pricing**: Pro-rated credits for upgrades
3. **Transparent**: Clear pricing breakdown
4. **Automatic**: No manual intervention needed
5. **Flexible**: Metered billing for teams
6. **Auditable**: Full invoice history
7. **Professional**: Industry-standard upgrade flow

## Summary

The upgrade system now provides:
- ✅ **Downgrade prevention** at API and UI levels
- ✅ **Automatic proration** with fair credit calculation
- ✅ **Invoice generation** for all transactions
- ✅ **Smart UI** showing current plan and available upgrades
- ✅ **Metered billing** with interactive slider
- ✅ **Complete audit trail** in database and Stripe

Users can confidently upgrade knowing they'll receive credit for unused time, and administrators can trust that downgrades won't create support issues!
