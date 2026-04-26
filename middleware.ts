import { checkBotId } from 'botid/server';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip bot detection for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if request is from a bot
  const result = await checkBotId();

  if (result.isBot) {
    console.log('[BotID] Blocked bot request:', {
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { error: 'Access denied', message: 'Automated requests not allowed' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};