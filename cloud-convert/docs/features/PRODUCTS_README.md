# Product-Based Stripe Checkout

## Overview
This system allows you to create products with different pricing tiers and handle Stripe payments based on product IDs.

## File Structure

```
src/
├── lib/
│   ├── products.ts          # Product definitions and utilities
│   └── stripe.ts            # Stripe configuration
├── app/
│   ├── (stripe)/
│   │   ├── checkout.tsx     # Checkout form component
│   │   ├── checkout/
│   │   │   └── page.tsx     # Checkout page with product info
│   │   ├── products/
│   │   │   └── page.tsx     # Product selection page
│   │   └── success/
│   │       └── page.tsx     # Payment success page
│   └── api/
│       └── create-payment-intent/
│           └── route.ts     # API endpoint for creating payment intents
```

## How It Works

### 1. Product Configuration (`src/lib/products.ts`)
Define your products with pricing and features:

```typescript
export const PRODUCTS: Record<string, Product> = {
    'basic': {
        id: 'basic',
        name: 'Basic Plan',
        description: 'Perfect for individuals',
        price: 999, // $9.99 in cents
        currency: 'usd',
        features: [
            '100 conversions per month',
            'Basic file formats',
            'Email support'
        ]
    },
    // Add more products...
};
```

### 2. User Flow

1. **Browse Products** → `/products`
   - Users see all available products with pricing and features
   - Click "Select Plan" to choose a product

2. **Checkout** → `/checkout?product=<productId>`
   - Displays product summary on the left
   - Payment form on the right
   - Creates PaymentIntent with product information

3. **Payment Success** → `/success?payment_intent=<id>`
   - Shows payment status
   - Displays transaction details

### 3. Adding New Products

Edit `src/lib/products.ts`:

```typescript
export const PRODUCTS: Record<string, Product> = {
    // ... existing products
    'custom': {
        id: 'custom',
        name: 'Custom Plan',
        description: 'Tailored to your needs',
        price: 9999, // $99.99
        currency: 'usd',
        features: [
            'Feature 1',
            'Feature 2',
            'Feature 3'
        ]
    }
};
```

### 4. API Usage

**Create Payment Intent:**
```bash
POST /api/create-payment-intent
Content-Type: application/json

{
  "productId": "basic"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "product": {
    "id": "basic",
    "name": "Basic Plan",
    "price": 999,
    "currency": "usd",
    ...
  }
}
```

### 5. Direct Links

You can create direct checkout links:
- `/checkout?product=basic`
- `/checkout?product=pro`
- `/checkout?product=enterprise`

### 6. Price Formatting

Use the helper function to format prices:
```typescript
import { formatPrice } from '@/lib/products';

formatPrice(999, 'usd'); // "$9.99"
```

## Environment Variables

Make sure you have these set in `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Customization

### Change Currency
Edit the currency in each product definition:
```typescript
currency: 'eur', // or 'gbp', 'cad', etc.
```

### Modify Product Features
Update the `features` array in product definitions.

### Styling
- Products page: `src/app/(stripe)/products/page.tsx`
- Checkout page: `src/app/(stripe)/checkout/page.tsx`
- Checkout form: `src/app/(stripe)/checkout.tsx`

All styling uses Tailwind CSS classes.
