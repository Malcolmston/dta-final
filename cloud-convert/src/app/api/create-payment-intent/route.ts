// API endpoint for creating Stripe payment intents

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProduct } from '@/lib/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = getProduct(productId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.price,
      currency: product.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        productId: product.id,
        productName: product.name,
        userId: userId || '',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        description: product.description,
        features: product.features,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
