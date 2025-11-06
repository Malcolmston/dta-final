// API authentication and rate limiting

import { NextRequest } from 'next/server';
import { initializeDatabase, AppDataSource } from './database';
import { User } from '@/entities/User';
import { getTokenUsage, decrementTokenUsage, getTimeUntilReset } from './redis';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: Date;
  };
}

/**
 * Authenticate API request and check rate limits
 */
export async function authenticateAPIRequest(
  req: NextRequest
): Promise<AuthResult> {
  const tokenId = req.headers.get('x-user-id');
  const apiToken = req.headers.get('x-api-token');

  if (!tokenId || !apiToken) {
    return {
      success: false,
      error: 'Missing authentication headers (x-user-id, x-api-token)',
    };
  }

  try {
    // Initialize database
    await initializeDatabase();
    const userRepo = AppDataSource.getRepository(User);

    // Find user by token ID (simplified - in production, use proper token verification)
    const user = await userRepo.findOne({ where: { id: parseInt(tokenId) } });

    if (!user) {
      return {
        success: false,
        error: 'Invalid token',
      };
    }

    // Check rate limit using Redis
    const usage = await getTokenUsage(tokenId, user.id, user.token);

    if (usage.usesRemaining <= 0) {
      const resetTime = new Date(usage.lastRefresh + 60 * 60 * 1000);
      return {
        success: false,
        error: 'Rate limit exceeded',
        rateLimit: {
          remaining: 0,
          limit: usage.maxUses,
          resetAt: resetTime,
        },
      };
    }

    // Decrement usage
    const updatedUsage = await decrementTokenUsage(tokenId);

    const resetTime = new Date(usage.lastRefresh + 60 * 60 * 1000);

    return {
      success: true,
      user,
      rateLimit: {
        remaining: updatedUsage?.usesRemaining || 0,
        limit: usage.maxUses,
        resetAt: resetTime,
      },
    };
  } catch (error: any) {
    console.error('Auth error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  rateLimit: {
    remaining: number;
    limit: number;
    resetAt: Date;
  }
): void {
  headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  headers.set('X-RateLimit-Reset', rateLimit.resetAt.toISOString());
}
