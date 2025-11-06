// API v1 - File Compression Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPIRequest, addRateLimitHeaders } from '@/lib/apiAuth';
import { deductUserToken } from '@/lib/tokenActions';

/**
 * POST /api/v1/compress
 * Compress file (images, videos, documents)
 *
 * Headers:
 * - x-user-id: User ID
 * - x-api-token: API token
 *
 * Body (multipart/form-data):
 * - file: File to compress
 * - quality: Compression quality 1-100 (default: 80)
 * - maxWidth: Maximum width for images (optional)
 * - maxHeight: Maximum height for images (optional)
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
    const qualityStr = formData.get('quality') as string | null;
    const maxWidthStr = formData.get('maxWidth') as string | null;
    const maxHeightStr = formData.get('maxHeight') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Parse compression parameters
    const quality = qualityStr ? parseInt(qualityStr, 10) : 80;
    const maxWidth = maxWidthStr ? parseInt(maxWidthStr, 10) : undefined;
    const maxHeight = maxHeightStr ? parseInt(maxHeightStr, 10) : undefined;

    // Validate quality
    if (quality < 1 || quality > 100) {
      return NextResponse.json(
        { error: 'Quality must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit for compression)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name;

    console.log(`[COMPRESS] User ${user?.id}: ${fileName}, ${file.size} bytes, quality: ${quality}`);

    // TODO: Implement actual compression logic here
    // For now, return a mock response with reduced size
    const mockCompressedBuffer = buffer.slice(0, Math.floor(buffer.length * 0.7)); // Mock 30% reduction

    const compressionRatio = ((1 - mockCompressedBuffer.length / buffer.length) * 100).toFixed(1);

    // Deduct token from user balance
    await deductUserToken(user!.id);
    console.log(`[TOKEN] User ${user?.id} token deducted, remaining: ${(user!.token || 0) - 1}`);

    // Create response with compressed file
    const response = new NextResponse(mockCompressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="compressed-${fileName}"`,
        'X-Original-Size': buffer.length.toString(),
        'X-Compressed-Size': mockCompressedBuffer.length.toString(),
        'X-Compression-Ratio': `${compressionRatio}%`,
      },
    });

    // Add rate limit headers
    if (rateLimit) {
      addRateLimitHeaders(response.headers, rateLimit);
    }

    return response;

  } catch (error: any) {
    console.error('[COMPRESS ERROR]:', error);
    return NextResponse.json(
      { error: 'Compression failed', details: error.message },
      { status: 500 }
    );
  }
}
