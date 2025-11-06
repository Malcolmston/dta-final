// API v1 - File Conversion Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPIRequest, addRateLimitHeaders } from '@/lib/apiAuth';
import { deductUserToken } from '@/lib/tokenActions';

/**
 * POST /api/v1/convert
 * Convert file from one format to another
 *
 * Headers:
 * - x-user-id: User ID
 * - x-api-token: API token
 *
 * Body (multipart/form-data):
 * - file: File to convert
 * - outputFormat: Target format (e.g., 'pdf', 'png', 'jpg', 'docx')
 * - options: JSON string with conversion options (optional)
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
    const outputFormat = formData.get('outputFormat') as string | null;
    const optionsStr = formData.get('options') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!outputFormat) {
      return NextResponse.json(
        { error: 'Output format is required' },
        { status: 400 }
      );
    }

    // Parse options if provided
    let options = {};
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid options JSON' },
          { status: 400 }
        );
      }
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 413 }
      );
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFormat = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    console.log(`[CONVERT] User ${user?.id}: ${inputFormat} → ${outputFormat}, ${file.size} bytes`);

    // TODO: Implement actual conversion logic here
    // For now, return a mock response
    const mockConvertedBuffer = buffer; // In production, this would be the converted file

    // Deduct token from user balance
    await deductUserToken(user!.id);
    console.log(`[TOKEN] User ${user?.id} token deducted, remaining: ${(user!.token || 0) - 1}`);

    // Create response with converted file
    const response = new NextResponse(mockConvertedBuffer, {
      status: 200,
      headers: {
        'Content-Type': getContentType(outputFormat),
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    });

    // Add rate limit headers
    if (rateLimit) {
      addRateLimitHeaders(response.headers, rateLimit);
    }

    return response;

  } catch (error: any) {
    console.error('[CONVERT ERROR]:', error);
    return NextResponse.json(
      { error: 'Conversion failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get Content-Type for output format
 */
function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    html: 'text/html',
    json: 'application/json',
    xml: 'application/xml',
  };

  return contentTypes[format.toLowerCase()] || 'application/octet-stream';
}
