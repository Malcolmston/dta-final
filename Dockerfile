FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app

# Install Python for any build scripts
RUN apk add --no-cache python3 py3-pip

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npm run build


FROM node:20-bookworm AS runner

WORKDIR /app

# Install Python for the scrape functionality
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip

# Install Python dependencies
COPY --from=builder /app/scrape/requirements.prod.txt ./scrape/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r scrape/requirements.txt

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/scrape ./scrape

# Expose port
EXPOSE 3000

# Start the production server
CMD ["node", "server.js"]
