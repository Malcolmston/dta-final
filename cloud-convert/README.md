# Cloud Convert

A Next.js application for file conversion with Stripe payment integration, subscription management, and API rate limiting.

## Features

- 🔄 File conversion API (images, documents, etc.)
- 💳 Stripe payment integration
- 📊 Subscription management with multiple tiers
- 🎟️ Token-based API rate limiting
- 👥 Team management with metered billing
- 🔐 User authentication and authorization
- 📈 Usage tracking and analytics

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: MySQL with TypeORM
- **Caching**: Redis for rate limiting
- **Payments**: Stripe
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- Redis 6+
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cloud-convert.git
cd cloud-convert
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Database credentials
- Stripe API keys
- Redis URL

4. Run database migrations:
```bash
yarn typeorm migration:run
```

5. Start the development server:
```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
cloud-convert/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── (stripe)/          # Stripe-related pages
│   │   │   ├── checkout/      # Checkout page
│   │   │   ├── products/      # Product selection
│   │   │   └── success/       # Payment success
│   │   └── webhook/           # Stripe webhook handler
│   ├── entities/              # TypeORM entities
│   │   ├── User.ts
│   │   └── Subscription.ts
│   └── lib/                   # Library files
│       ├── products.ts        # Product definitions
│       ├── stripe.ts          # Stripe configuration
│       ├── database.ts        # Database configuration
│       └── tokenActions.ts    # Token management
├── docs/                      # Documentation
│   ├── features/              # Feature documentation
│   └── deployment/            # Deployment guides
├── public/                    # Static assets
└── package.json
```

## Subscription Plans

### User Plans
- **Basic** - $9.99/month - 100 tokens/hour
- **Pro** - $19.99/month - 500 tokens/hour
- **Enterprise** - $49.99/month - 2000 tokens/hour

### Developer/API Plans
- **API Starter** - $29.99/month - 200 tokens/hour
- **API Professional** - $99.99/month - 1000 tokens/hour
- **API Enterprise** - $299.99/month - 5000 tokens/hour

### Team Plans
- **Team Starter** - $29.99/month - 3 seats, 1000 tokens/hour
- **Team Metered** - $49.99/month - 5 seats, 1000 tokens/hour, pay-per-use

## Webhook Setup

The application uses Stripe webhooks to process payments and manage subscriptions.

### Local Development with Stripe CLI

```bash
stripe listen --forward-to localhost:3000/webhook
```

### Production Webhook URL

Set up webhook endpoint in Stripe Dashboard:
```
https://yourdomain.com/webhook
```

Events to subscribe to:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database credentials
- `REDIS_URL` - Redis connection URL

## Documentation

Detailed documentation is available in the `/docs` directory:

- [Product System](./docs/features/PRODUCTS_README.md)
- [Subscription Features](./docs/features/SUBSCRIPTION_FEATURES.md)
- [Token System](./docs/features/TOKEN_SYSTEM.md)
- [Team Management](./docs/features/TEAM_MANAGEMENT.md)
- [Webhook Setup](./docs/deployment/WEBHOOK_SETUP.md)
- [Webhook Testing](./docs/deployment/WEBHOOK_TESTING.md)

## Testing

### Test Stripe Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Any future expiration date and any 3-digit CVC.

## Deployment

The application can be deployed to:
- Vercel (recommended for Next.js)
- Docker containers
- Any Node.js hosting platform

See [deployment documentation](./docs/deployment/) for detailed guides.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
