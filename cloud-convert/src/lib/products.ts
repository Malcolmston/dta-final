// Product definitions for Cloud Convert subscription system

export type ProductType =
  | 'FREE'
  | 'BASIC'
  | 'PRO'
  | 'ENTERPRISE'
  | 'API_STARTER'
  | 'API_PROFESSIONAL'
  | 'API_ENTERPRISE'
  | 'TEAM_STARTER'
  | 'TEAM_METERED';

export type UserType = 'user' | 'developer';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  userType: UserType;
  tokens: number; // hourly rate limit
  metered?: boolean;
  unitLimit?: number; // for metered plans
  maxSeats?: number; // for team plans
  features: string[];
}

// User subscription products
export const USER_PRODUCTS: Record<string, Product> = {
  'basic': {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for individuals',
    price: 999, // $9.99
    currency: 'usd',
    userType: 'user',
    tokens: 100,
    features: [
      '100 conversions per month',
      'Basic file formats',
      'Email support',
      '100 requests/hour'
    ]
  },
  'pro': {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For power users',
    price: 1999, // $19.99
    currency: 'usd',
    userType: 'user',
    tokens: 500,
    features: [
      '1,000 conversions per month',
      'All file formats',
      'Priority support',
      '500 requests/hour',
      'Batch processing'
    ]
  },
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For teams and businesses',
    price: 4999, // $49.99
    currency: 'usd',
    userType: 'user',
    tokens: 2000,
    features: [
      'Unlimited conversions',
      'All file formats',
      'Dedicated support',
      '2000 requests/hour',
      'Batch processing',
      'Custom integrations'
    ]
  }
};

// Developer/API products
export const DEVELOPER_PRODUCTS: Record<string, Product> = {
  'api-starter': {
    id: 'api-starter',
    name: 'API Starter',
    description: 'Get started with our API',
    price: 2999, // $29.99
    currency: 'usd',
    userType: 'developer',
    tokens: 200,
    features: [
      '5,000 API calls/month',
      'All conversion endpoints',
      'API documentation',
      '200 requests/hour',
      'Email support'
    ]
  },
  'api-professional': {
    id: 'api-professional',
    name: 'API Professional',
    description: 'For professional developers',
    price: 9999, // $99.99
    currency: 'usd',
    userType: 'developer',
    tokens: 1000,
    features: [
      '50,000 API calls/month',
      'All conversion endpoints',
      'Priority support',
      '1000 requests/hour',
      'Webhook notifications',
      'Dedicated account manager'
    ]
  },
  'api-enterprise': {
    id: 'api-enterprise',
    name: 'API Enterprise',
    description: 'For large-scale applications',
    price: 29999, // $299.99
    currency: 'usd',
    userType: 'developer',
    tokens: 5000,
    features: [
      'Unlimited API calls',
      'All conversion endpoints',
      '24/7 premium support',
      '5000 requests/hour',
      'Webhook notifications',
      'Dedicated infrastructure',
      'SLA guarantee'
    ]
  }
};

// Team products
export const TEAM_PRODUCTS: Record<string, Product> = {
  'team-starter': {
    id: 'team-starter',
    name: 'Team Starter',
    description: 'For small teams',
    price: 2999, // $29.99
    currency: 'usd',
    userType: 'user',
    tokens: 1000,
    maxSeats: 3,
    features: [
      'Up to 3 team members',
      '5,000 conversions/month',
      'All conversion formats',
      'Team management dashboard',
      '1000 requests/hour',
      'Email support'
    ]
  },
  'team-metered': {
    id: 'team-metered',
    name: 'Team Metered',
    description: 'Pay per use for teams',
    price: 4999, // $49.99 base
    currency: 'usd',
    userType: 'user',
    tokens: 1000,
    metered: true,
    unitLimit: 10000,
    maxSeats: 5,
    features: [
      'Up to 5 team members',
      '10,000 conversions/month included',
      'Pay per additional conversion',
      'All conversion endpoints',
      'Rate limit: 1000 req/hour',
      'Priority support',
      'Team management dashboard'
    ]
  }
};

// All products combined
export const PRODUCTS: Record<string, Product> = {
  ...USER_PRODUCTS,
  ...DEVELOPER_PRODUCTS,
  ...TEAM_PRODUCTS
};

// Helper function to get product by ID
export function getProduct(productId: string): Product | undefined {
  return PRODUCTS[productId];
}

// Helper function to format price
export function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(price / 100);
}

// Helper function to get product limits
export function getProductLimits(productId: string): { conversions?: number; seats?: number } {
  const product = getProduct(productId);
  if (!product) return {};

  return {
    conversions: product.unitLimit,
    seats: product.maxSeats
  };
}

// Helper to get subscription type from product ID
export function getSubscriptionType(productId: string): ProductType {
  const mapping: Record<string, ProductType> = {
    'basic': 'BASIC',
    'pro': 'PRO',
    'enterprise': 'ENTERPRISE',
    'api-starter': 'API_STARTER',
    'api-professional': 'API_PROFESSIONAL',
    'api-enterprise': 'API_ENTERPRISE',
    'team-starter': 'TEAM_STARTER',
    'team-metered': 'TEAM_METERED'
  };

  return mapping[productId] || 'FREE';
}
