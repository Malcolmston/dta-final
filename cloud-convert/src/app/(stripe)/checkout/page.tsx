'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { getProduct, formatPrice } from '@/lib/products';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');

  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  const product = productId ? getProduct(productId) : null;

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    // Create payment intent
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        userId: '1', // TODO: Get from auth
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h1>
          <a href="/products" className="text-blue-600 hover:underline">
            View all products
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(product.price, product.currency)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Billed monthly • Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            {clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <CheckoutForm />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
