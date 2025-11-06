// API v1 - Image Resize Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPIRequest, addRateLimitHeaders } from '@/lib/apiAuth';
import { deductUserToken } from '@/lib/tokenActions';

/**
 * POST /api/v1/resize
 * Resize images to specific dimensions
 *
 * Headers:
 * - x-user-id: User ID
 * - x-api-token: API token
 *
 * Body (multipart/form-data):
 * - file: Image file to resize
 * - width: Target width in pixels (required if height not provided)
 * - height: Target height in pixels (required if width not provided)
 * - mode: Resize mode ('fit', 'fill', 'cover', 'contain') - default: 'fit'
 * - format: Output format (optional, defaults to input format)
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate and check rate limits
    const authResult = await authenticateAPIRequest(req);

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        {
          status: authResult.error === 'Rate limit exceeded' ? 429 : 401,
          headers: authResult.rateLimit
            ? Object.fromEntries(
                Object.entries({
                  'X-RateLimit-Limit': authResult.rateLimit.limit.toString(),
                  'X-RateLimit-Remaining': authResult.rateLimit.remaining.toString(),
                  'X-RateLimit-Reset': authResult.rateLimit.resetAt.toISOString(),
                })
              )
            : {}
        }
      );
    }

    const { user, rateLimit } = authResult;

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const widthStr = formData.get('width') as string | null;
    const heightStr = formData.get('height') as string | null;
    const mode = (formData.get('mode') as string) || 'fit';
    const format = formData.get('format') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Parse dimensions
    const width = widthStr ? parseInt(widthStr, 10) : null;
    const height = heightStr ? parseInt(heightStr, 10) : null;

    if (!width && !height) {
      return NextResponse.json(
        { error: 'Either width or height must be provided' },
        { status: 400 }
      );
    }

    // Validate dimensions
    const maxDimension = 10000;
    if ((width && (width < 1 || width > maxDimension)) ||
        (height && (height < 1 || height > maxDimension))) {
      return NextResponse.json(
        { error: `Dimensions must be between 1 and ${maxDimension}` },
        { status: 400 }
      );
    }

    // Validate mode
    const validModes = ['fit', 'fill', 'cover', 'contain'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: `Mode must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 20MB limit' },
        { status: 413 }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFormat = file.type.split('/')[1] || 'unknown';
    const outputFormat = format || inputFormat;

    console.log(
      `[RESIZE] User ${user?.id}: ${file.name}, ${width || 'auto'}x${height || 'auto'}, mode: ${mode}, ${file.size} bytes`
    );

    // TODO: Implement actual resize logic here
    // For now, return a mock response
    const mockResizedBuffer = buffer; // In production, this would be the resized image

    // Deduct token from user balance
    await deductUserToken(user!.id);
    console.log(`[TOKEN] User ${user?.id} token deducted, remaining: ${(user!.token || 0) - 1}`);

    // Create response with resized image
    const response = new NextResponse(mockResizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': `image/${outputFormat}`,
        'Content-Disposition': `attachment; filename="resized.${outputFormat}"`,
        'X-Resize-Width': width?.toString() || 'auto',
        'X-Resize-Height': height?.toString() || 'auto',
        'X-Resize-Mode': mode,
      },
    });

    // Add rate limit headers
    if (rateLimit) {
      addRateLimitHeaders(response.headers, rateLimit);
    }

    return response;

  } catch (error: any) {
    console.error('[RESIZE ERROR]:', error);
    return NextResponse.json(
      { error: 'Resize failed', details: error.message },
      { status: 500 }
    );
  }
}
