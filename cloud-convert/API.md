# Cloud Convert API Documentation

## Overview

Cloud Convert API provides file conversion, compression, and manipulation services with rate limiting and token-based authentication.

Base URL: `http://localhost:3000/api`

## Authentication

All API endpoints require authentication headers:

```
x-user-id: <your-user-id>
x-api-token: <your-api-token>
```

## Rate Limiting

- Rate limits are enforced hourly per user subscription tier
- Response headers include:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests this hour
  - `X-RateLimit-Reset`: ISO timestamp when limit resets

## Endpoints

### 1. Convert File

**POST** `/api/v1/convert`

Convert files from one format to another.

**Request Headers:**
```
Content-Type: multipart/form-data
x-user-id: 123
x-api-token: your-token-here
```

**Request Body (form-data):**
- `file`: File to convert (required)
- `outputFormat`: Target format - `pdf`, `png`, `jpg`, `docx`, etc. (required)
- `options`: JSON string with conversion options (optional)

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/convert \
  -H "x-user-id: 123" \
  -H "x-api-token: your-token" \
  -F "file=@document.docx" \
  -F "outputFormat=pdf" \
  -F 'options={"quality": 90}' \
  -o converted.pdf
```

**Response:**
- Success: Binary file download
- Error: JSON error object

**Limits:**
- Max file size: 10MB

---

### 2. Compress File

**POST** `/api/v1/compress`

Compress images, videos, or documents.

**Request Headers:**
```
Content-Type: multipart/form-data
x-user-id: 123
x-api-token: your-token-here
```

**Request Body (form-data):**
- `file`: File to compress (required)
- `quality`: Compression quality 1-100 (default: 80)
- `maxWidth`: Maximum width for images in pixels (optional)
- `maxHeight`: Maximum height for images in pixels (optional)

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/compress \
  -H "x-user-id: 123" \
  -H "x-api-token: your-token" \
  -F "file=@image.jpg" \
  -F "quality=70" \
  -F "maxWidth=1920" \
  -o compressed.jpg
```

**Response:**
- Success: Binary compressed file
- Response Headers:
  - `X-Original-Size`: Original file size in bytes
  - `X-Compressed-Size`: Compressed file size in bytes
  - `X-Compression-Ratio`: Percentage saved

**Limits:**
- Max file size: 50MB

---

### 3. Resize Image

**POST** `/api/v1/resize`

Resize images to specific dimensions.

**Request Headers:**
```
Content-Type: multipart/form-data
x-user-id: 123
x-api-token: your-token-here
```

**Request Body (form-data):**
- `file`: Image file (required)
- `width`: Target width in pixels (required if height not provided)
- `height`: Target height in pixels (required if width not provided)
- `mode`: Resize mode - `fit`, `fill`, `cover`, `contain` (default: `fit`)
- `format`: Output format (optional, defaults to input format)

**Resize Modes:**
- `fit`: Resize to fit within dimensions, maintaining aspect ratio
- `fill`: Resize and crop to fill dimensions exactly
- `cover`: Resize to cover dimensions, may crop edges
- `contain`: Resize to fit within dimensions with padding

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/resize \
  -H "x-user-id: 123" \
  -H "x-api-token: your-token" \
  -F "file=@photo.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "mode=cover" \
  -o resized.jpg
```

**Response:**
- Success: Binary resized image
- Response Headers:
  - `X-Resize-Width`: Applied width
  - `X-Resize-Height`: Applied height
  - `X-Resize-Mode`: Applied mode

**Limits:**
- Max file size: 20MB
- Max dimensions: 10000x10000 pixels

---

### 4. Get File Info

**POST** `/api/v1/info`

Get file metadata and information without modification.

**Request Headers:**
```
Content-Type: multipart/form-data
x-user-id: 123
x-api-token: your-token-here
```

**Request Body (form-data):**
- `file`: File to analyze (required)

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/info \
  -H "x-user-id: 123" \
  -H "x-api-token: your-token" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "document.pdf",
    "fileSize": 1048576,
    "fileSizeFormatted": "1 MB",
    "mimeType": "application/pdf",
    "extension": "pdf",
    "category": "document",
    "lastModified": 1699564800000,
    "lastModifiedDate": "2024-11-09T12:00:00.000Z",
    "metadata": {
      "isImage": false,
      "isVideo": false,
      "isAudio": false,
      "isDocument": true
    },
    "checksum": "abc123..."
  }
}
```

**Limits:**
- Max file size: 100MB

**Note:** This endpoint does NOT deduct tokens (metadata retrieval only)

---

## Payment & Subscription

### Create Payment Intent

**POST** `/api/create-payment-intent`

Create a Stripe payment intent for subscription purchase.

**Request Body:**
```json
{
  "productId": "basic",
  "userId": 123
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "product": {
    "id": "basic",
    "name": "Basic Plan",
    "price": 999,
    "tokens": 100
  }
}
```

### Webhook Handler

**POST** `/webhook`

Stripe webhook endpoint for payment events.

**Headers:**
```
stripe-signature: <stripe-signature>
```

**Events Handled:**
- `payment_intent.succeeded`: Creates subscription and grants tokens
- `customer.subscription.deleted`: Marks subscription as cancelled

---

## Dashboard

### Get User Subscription

**GET** `/api/dashboard/subscription?userId=123`

Get the latest subscription for a user.

**Response:**
```json
{
  "id": 1,
  "userId": 123,
  "productId": "basic",
  "type": "BASIC",
  "status": "ACTIVE",
  "amount": 999,
  "startDate": "2024-11-09T12:00:00.000Z",
  "endDate": "2024-12-09T12:00:00.000Z",
  "autoRenew": true
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

**Common Error Codes:**
- `400` Bad Request - Invalid parameters
- `401` Unauthorized - Missing or invalid credentials
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `413` Payload Too Large - File exceeds size limit
- `429` Rate Limit Exceeded - Hourly quota exhausted
- `500` Internal Server Error - Server error

**Rate Limit Error Example:**
```json
{
  "error": "Rate limit exceeded"
}
```

Response headers will include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-11-09T13:00:00.000Z
```

---

## Subscription Tiers

| Tier | Price | Tokens/Hour | Features |
|------|-------|-------------|----------|
| **Basic** | $9.99/mo | 100 | Basic conversions |
| **Pro** | $29.99/mo | 500 | Advanced features |
| **Enterprise** | $99.99/mo | 2000 | Priority support |
| **API Basic** | $19.99/mo | 1000 | API access |
| **API Pro** | $49.99/mo | 5000 | High volume API |
| **API Enterprise** | $199.99/mo | 20000 | Unlimited features |
| **Team Small** | $79.99/mo | 1000 | 5 users |
| **Team Medium** | $149.99/mo | 3000 | 15 users |
| **Team Large** | $299.99/mo | 10000 | 50 users |

---

## Development

### Running Locally

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
yarn dev

# Or with Docker
docker-compose up
```

### Environment Variables

Required variables:
- `DATABASE_URL`: MySQL connection string
- `REDIS_URL`: Redis connection string
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe public key

### Docker Services

The docker-compose setup includes:
- **app**: Next.js application (port 3000)
- **db**: MySQL 8.0 (port 3306)
- **redis**: Redis 7 (port 6379)
- **db-gui**: phpMyAdmin (port 8080)
- **stripe-cli**: Automatic webhook forwarding

---

## Testing with cURL

### Test Convert Endpoint
```bash
# Convert image to PDF
curl -X POST http://localhost:3000/api/v1/convert \
  -H "x-user-id: 1" \
  -H "x-api-token: test-token" \
  -F "file=@test.jpg" \
  -F "outputFormat=pdf" \
  -o output.pdf
```

### Test Compress Endpoint
```bash
# Compress image
curl -X POST http://localhost:3000/api/v1/compress \
  -H "x-user-id: 1" \
  -H "x-api-token: test-token" \
  -F "file=@photo.jpg" \
  -F "quality=60" \
  -o compressed.jpg
```

### Test Resize Endpoint
```bash
# Resize image
curl -X POST http://localhost:3000/api/v1/resize \
  -H "x-user-id: 1" \
  -H "x-api-token: test-token" \
  -F "file=@image.png" \
  -F "width=500" \
  -F "mode=fit" \
  -o resized.png
```

### Test Info Endpoint
```bash
# Get file info
curl -X POST http://localhost:3000/api/v1/info \
  -H "x-user-id: 1" \
  -H "x-api-token: test-token" \
  -F "file=@document.pdf"
```

---

## Notes

- All file processing endpoints currently return mock data
- Actual conversion/compression logic needs to be implemented
- Consider using libraries like:
  - `sharp` for image processing
  - `pdf-lib` for PDF manipulation
  - `ffmpeg` for video/audio processing
  - `libreoffice` for document conversion
