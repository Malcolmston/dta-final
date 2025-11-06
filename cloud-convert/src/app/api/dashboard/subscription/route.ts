// API endpoint to fetch user's subscription

import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, AppDataSource } from '@/lib/database';
import { Subscription } from '@/entities/Subscription';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    // For now, using query parameter
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await initializeDatabase();
    const subscriptionRepo = AppDataSource.getRepository(Subscription);

    // Get latest active subscription
    const subscription = await subscriptionRepo.findOne({
      where: { userId: parseInt(userId) },
      order: { createdAt: 'DESC' },
    });

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
