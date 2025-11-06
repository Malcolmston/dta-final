// API v1 - File Info/Metadata Endpoint

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAPIRequest, addRateLimitHeaders } from '@/lib/apiAuth';

/**
 * POST /api/v1/info
 * Get file metadata and information
 *
 * Headers:
 * - x-user-id: User ID
 * - x-api-token: API token
 *
 * Body (multipart/form-data):
 * - file: File to analyze
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

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit for info)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 413 }
      );
    }

    // Get file buffer for analysis
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`[INFO] User ${user?.id}: ${file.name}, ${file.size} bytes`);

    // Analyze file
    const fileInfo = {
      fileName: file.name,
      fileSize: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      mimeType: file.type || 'unknown',
      extension: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      category: getFileCategory(file.type),
      lastModified: file.lastModified,
      lastModifiedDate: new Date(file.lastModified).toISOString(),

      // Additional metadata (would be extracted with proper libraries in production)
      metadata: {
        isImage: file.type.startsWith('image/'),
        isVideo: file.type.startsWith('video/'),
        isAudio: file.type.startsWith('audio/'),
        isDocument: isDocumentType(file.type),
        // TODO: Add image dimensions, video duration, etc.
      },

      // Hash for uniqueness (simplified - in production use crypto.createHash)
      checksum: Buffer.from(buffer.slice(0, 1024)).toString('base64').slice(0, 32),
    };

    // Note: This endpoint doesn't deduct tokens as it's just metadata retrieval

    const response = NextResponse.json(
      {
        success: true,
        data: fileInfo,
      },
      { status: 200 }
    );

    // Add rate limit headers
    if (rateLimit) {
      addRateLimitHeaders(response.headers, rateLimit);
    }

    return response;

  } catch (error: any) {
    console.error('[INFO ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to get file info', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file category based on MIME type
 */
function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (isDocumentType(mimeType)) return 'document';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType === 'application/json') return 'data';
  if (mimeType === 'application/xml') return 'data';
  if (mimeType.includes('zip') || mimeType.includes('tar')) return 'archive';

  return 'other';
}

/**
 * Check if MIME type is a document
 */
function isDocumentType(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  return documentTypes.includes(mimeType);
}
