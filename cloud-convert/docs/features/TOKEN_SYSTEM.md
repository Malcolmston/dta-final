# Token System Documentation

## Overview

The token system manages user access to API operations through a dual-layer rate limiting approach:
1. **Redis Rate Limiting**: Controls hourly API request limits (managed by `src/lib/redis.ts`)
2. **Database Token Balance**: Tracks long-term token balance that decreases with each successful operation

## Architecture

### Components

1. **Product Token Allocation** (`src/lib/products.ts`)
   - Each subscription product defines a `tokens` value
   - Tokens represent the hourly rate limit for API requests
   - Free users: 50 tokens/hour (default)
   - Basic plan: 100 tokens/hour
   - Pro plan: 500 tokens/hour
   - Enterprise: 2000 tokens/hour
   - API Starter: 200 tokens/hour
   - API Professional: 1000 tokens/hour
   - API Enterprise: 5000 tokens/hour
   - Team plans: 1000-10000 tokens/hour

2. **Token Actions** (`src/lib/tokenActions.ts`)
   - `deductUserToken(userId, amount)`: Deduct tokens from user balance
   - `checkUserTokens(userId, required)`: Check if user has enough tokens
   - `addUserTokens(userId, amount)`: Add tokens (refunds/admin)
   - `getUserTokenBalance(userId)`: Get current balance

3. **Webhook Integration** (`src/app/webhook/route.tsx`)
   - On successful subscription purchase (`payment_intent.succeeded`)
   - Grants tokens based on purchased product
   - Updates `user.token` field in database

4. **API Integration** (All `/api/(v1)/` routes)
   - Convert: `src/app/api/(v1)/convert/[name]/route.ts`
   - Compress: `src/app/api/(v1)/compress/[name]/route.ts`
   - Other: `src/app/api/(v1)/other/[name]/route.ts`
   - Deducts 1 token after successful operation
   - Returns `X-Token-Balance` header with remaining balance

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Purchases Subscription               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Stripe Webhook (payment_intent.succeeded)       │
│  1. Verify payment                                           │
│  2. Look up product details                                  │
│  3. Grant tokens: user.token = product.tokens                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Makes API Request                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Redis Rate Limiting (apiAuthRedis.ts)           │
│  1. Check Redis for hourly usage                             │
│  2. Limit: N requests/hour (N = user.token)                  │
│  3. If exceeded: Return 429 Rate Limit Exceeded              │
└────────────────────────┬────────────────────────────────────┘
                         │ Allowed
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Process API Request (convert/compress/other)    │
│  1. Execute file operation                                   │
│  2. Return response                                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Success
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Token Deduction (tokenActions.ts)               │
│  1. deductUserToken(userId, 1)                               │
│  2. user.token = user.token - 1                              │
│  3. Save to database                                         │
│  4. Return X-Token-Balance header                            │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### User Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    token INT DEFAULT 50,  -- Token balance for long-term tracking
    role ENUM(...),
    stripeCustomerId VARCHAR(255),
    ...
);
```

### Subscription Table
```sql
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
    productId VARCHAR(255),
    productName VARCHAR(255),
    subscriptionType ENUM(...),
    subscriptionStatus ENUM('ACTIVE', 'CANCELLED', ...),
    amount INT,
    startDate DATETIME,
    endDate DATETIME,
    ...
);
```

## Redis Structure

```
Key: api:token:{tokenId}
Value: {
    "userId": 123,
    "tokenId": "uuid-here",
    "usesRemaining": 45,
    "maxUses": 50,
    "lastRefresh": 1699564800000,
    "sessionStart": 1699564800000
}
TTL: Cleaned up after 24 hours of inactivity
```

## API Endpoints

### Check Token Balance
```bash
GET /api/user/token-balance
Authorization: Session-based

Response:
{
    "balance": 500,
    "userId": 123
}
```

### Rate Limit Status
```bash
GET /api/rate-limit-status
Headers:
  x-user-id: {tokenId}
  x-api-token: {token}

Response:
{
    "tokenId": "uuid",
    "userId": 123,
    "username": "user@example.com",
    "rateLimit": {
        "remaining": 45,
        "limit": 50,
        "resetAt": "2024-11-04T14:00:00.000Z",
        "timeUntilResetMs": 3540000,
        "lastRefresh": "2024-11-04T13:00:00.000Z",
        "sessionStart": "2024-11-04T13:00:00.000Z"
    }
}
```

## Response Headers

All API operations return these headers:

```
X-RateLimit-Limit: 50           # Hourly request limit
X-RateLimit-Remaining: 45       # Requests remaining this hour
X-RateLimit-Reset: 2024-11-04T14:00:00Z  # When limit resets
X-Token-Balance: 500            # Database token balance
```

## Usage Examples

### 1. User Signs Up (Free Plan)
- User registers → `user.token = 50` (default)
- Can make 50 requests per hour
- No subscription required

### 2. User Purchases Pro Plan ($19.99/month)
```javascript
// Webhook receives payment_intent.succeeded
const product = getProduct('pro');  // { tokens: 500 }
user.token = product.tokens;        // Grant 500 tokens/hour
await userRepo.save(user);
```

### 3. User Makes API Request
```javascript
// 1. Redis checks hourly limit
const usage = await getTokenUsage(tokenId, userId, user.token);
// usage.usesRemaining = 45, usage.maxUses = 500

if (usage.usesRemaining <= 0) {
    return 429; // Rate limit exceeded
}

// 2. Process request
const response = await fileOperation();

// 3. Deduct database token (if configured for per-action charging)
if (response.ok) {
    await deductUserToken(userId, 1);
    // user.token = 499 (example)
}
```

## Configuration

### Environment Variables
```bash
REDIS_URL=redis://redis:6379
CLEANUP_CRON_SECRET=your_secret_here
```

### Product Configuration
Edit `src/lib/products.ts` to modify token allocations:

```typescript
export const USER_PRODUCTS: Record<string, Product> = {
    'pro': {
        id: 'pro',
        name: 'Pro Plan',
        price: 1999,
        tokens: 500,  // ← Modify this
        // ...
    }
};
```

## Token Depletion Handling

### Scenario: User Runs Out of Tokens

#### Option 1: Redis Rate Limiting (Hourly Reset)
- User hits rate limit
- Redis returns 429 with `resetAt` timestamp
- User waits until next hour
- Redis automatically resets `usesRemaining` to `maxUses`

#### Option 2: Database Token Balance (Purchase Required)
- User's `user.token` reaches 0
- User must upgrade subscription or purchase more tokens
- Admin can manually add tokens via `addUserTokens(userId, amount)`

## Admin Operations

### Add Tokens to User
```typescript
import { addUserTokens } from '@/lib/tokenActions';

// Grant 1000 bonus tokens
await addUserTokens(userId, 1000);
```

### Check User Balance
```typescript
import { getUserTokenBalance } from '@/lib/tokenActions';

const { balance } = await getUserTokenBalance(userId);
console.log(`User has ${balance} tokens`);
```

### Reset Rate Limit (Redis)
```typescript
import { resetTokenUsage } from '@/lib/redis';

// Force reset hourly limit
await resetTokenUsage(tokenId);
```

## Monitoring

### Logs
```bash
# Token grants (webhook)
[TOKENS] Granted 500 tokens to user 123

# Token deductions (API)
[TOKEN] Successfully deducted 1 token from user 123. Remaining: 499

# Rate limit checks
[REDIS] User 123 has 45/50 requests remaining
```

### Metrics
- Track token grants in webhook
- Track deductions per endpoint
- Monitor rate limit exceedances
- Alert on low token balances

## Testing

### Test Token Grant on Purchase
```bash
# Simulate webhook
curl -X POST http://localhost:3001/webhook \
  -H "stripe-signature: test_signature" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "metadata": {
          "userId": "123",
          "productId": "pro"
        }
      }
    }
  }'
```

### Test API with Tokens
```bash
# Make API request
curl -X POST http://localhost:3001/api/v1/convert/image \
  -H "x-user-id: your-token-id" \
  -H "x-api-token: your-token" \
  -F "file=@test.png" \
  -F "output_format=jpg"

# Check headers
X-RateLimit-Remaining: 45
X-Token-Balance: 499
```

## Future Enhancements

1. **Token Packages**: Allow users to purchase additional token bundles
2. **Usage Analytics**: Dashboard showing token consumption over time
3. **Token Expiry**: Auto-refill tokens on subscription renewal
4. **Team Token Pooling**: Share token balance across team members
5. **Token Alerts**: Email notifications at 20%, 10%, 5% remaining
6. **Tiered Pricing**: Dynamic pricing based on token consumption

## Troubleshooting

### Issue: Tokens not granted after purchase
**Check:**
1. Webhook received? Check Stripe dashboard
2. Product ID correct? Verify metadata
3. User exists? Check database
4. Logs show token grant? Search for `[TOKENS] Granted`

### Issue: Token deduction not working
**Check:**
1. API response successful? (response.ok === true)
2. User authenticated? (authResult.user exists)
3. Database connection? Check TypeORM logs
4. Logs show deduction? Search for `[TOKEN] Successfully deducted`

### Issue: Rate limit still applies with upgraded plan
**Check:**
1. Redis session active? May need to wait for refresh
2. User token updated in DB? Query `user.token`
3. Redis using correct maxUses? Check `getTokenUsage()`
4. Force reset: `await resetTokenUsage(tokenId)`
