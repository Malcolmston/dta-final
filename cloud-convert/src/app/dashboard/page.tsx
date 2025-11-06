'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  id: number;
  subscriptionType: string;
  subscriptionStatus: string;
  productName: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  cancelledAt: string | null;
}

export default function Dashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/dashboard/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800';
      case 'PRO':
        return 'bg-purple-100 text-purple-800';
      case 'ENTERPRISE':
        return 'bg-indigo-100 text-indigo-800';
      case 'API_STARTER':
        return 'bg-cyan-100 text-cyan-800';
      case 'API_PROFESSIONAL':
        return 'bg-teal-100 text-teal-800';
      case 'API_ENTERPRISE':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {subscription.productName}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatPrice(subscription.amount, subscription.currency)}
                    <span className="text-sm font-normal text-gray-600">
                      /month
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(
                      subscription.subscriptionType
                    )}`}
                  >
                    {subscription.subscriptionType}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      subscription.subscriptionStatus
                    )}`}
                  >
                    {subscription.subscriptionStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Next Billing</p>
                  <p className="font-medium">
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Auto-Renewal</p>
                  <p className="font-medium">
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                {subscription.cancelledAt && (
                  <div>
                    <p className="text-sm text-gray-600">Cancelled At</p>
                    <p className="font-medium text-red-600">
                      {new Date(subscription.cancelledAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <a
                  href="/products"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Upgrade Plan
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You don't have an active subscription
              </p>
              <a
                href="/products"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Plans
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
