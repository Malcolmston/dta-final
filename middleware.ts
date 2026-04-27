import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';

// Paths that should always be accessible
const ALLOWED_PATHS = [
  '/api/health',
  '/api/cron/pull',
  '/api/cron/storage',
  '/api/cron/lookup',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Always allow non-API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Always allow cron endpoints
  if (ALLOWED_PATHS.includes(path)) {
    return NextResponse.next();
  }

  // Check if request is from a bot
  const result = await checkBotId();

  // Log but don't block - let the API handle it
  if (result.isBot) {
    console.log('[BotID] Bot detected but allowed:', {
      path,
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
    });
  }

  // Allow all requests - let the security middleware handle blocking
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};