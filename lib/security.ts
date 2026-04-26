// Comprehensive security middleware with logging and alerts

import { NextRequest, NextResponse } from "next/server";

// Attack pattern signatures for detection
const ATTACK_SIGNATURES = {
  sqlInjection: [
    /(\bOR\b|\bAND\b).*=.*['"]/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /('\s*OR\s*'1'\s*=\s*'1)/i,
    /(\bUNION\b|\bSELECT\b).*FROM/i,
    /;\s*DROP\s/i,
    /\/\*.*\*\//,
  ],
  xss: [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<img[^>]+onerror/i,
    /<svg[^>]+onload/i,
    /alert\s*\(/i,
  ],
  commandInjection: [
    /;\s*(ls|whoami|cat|echo|wget|curl)/i,
    /\|\s*(sh|bash|cmd)/i,
    /\$\(/,
    /`.*`/,
    /&&\s*(rm|chmod|mkdir)/i,
  ],
  pathTraversal: [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e/i,
    /etc\\passwd/i,
    /windows\\system32/i,
  ],
  ssrf: [
    /localhost/i,
    /127\.0\.0\.1/,
    /0\.0\.0\.0/,
    /\[::1\]/,
    /169\.254\.169\.254/,
    /metadata\.google/i,
  ],
};

// Known malicious IP ranges to block
const BLOCKED_IP_PATTERNS = [
  /^10\./,           // Private: 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private: 172.16.0.0/12
  /^192\.168\./,     // Private: 192.168.0.0/16
  /^127\./,          // Localhost
  /^0\./,            // Invalid
];

// Suspicious user agents
const BLOCKED_USER_AGENTS = [
  /python-requests/i,
  /scrapy/i,
  /curl/i,
  /wget/i,
  /bot/i,
  /spider/i,
  /crawler/i,
];

// Security log storage (in production, use proper logging service)
interface SecurityEvent {
  timestamp: string;
  type: "BLOCK" | "ALERT" | "RATE_LIMIT" | "ATTACK";
  ip: string;
  userAgent: string;
  path: string;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
}

const securityLog: SecurityEvent[] = [];
const MAX_LOG_ENTRIES = 1000;

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">) {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  securityLog.push(fullEvent);
  if (securityLog.length > MAX_LOG_ENTRIES) {
    securityLog.shift();
  }

  // Console log with severity
  const severityEmoji = {
    low: "ℹ️",
    medium: "⚠️",
    high: "🔶",
    critical: "🔴",
  };
  console.log(`[SECURITY] ${severityEmoji[event.severity]} ${event.type}: ${event.details} | IP: ${event.ip} | Path: ${event.path}`);
}

export function getSecurityLog(): SecurityEvent[] {
  return [...securityLog];
}

export function clearSecurityLog() {
  securityLog.length = 0;
}

// Attack detection function
export function detectAttack(input: string, type: keyof typeof ATTACK_SIGNATURES): boolean {
  const patterns = ATTACK_SIGNATURES[type];
  return patterns.some(pattern => pattern.test(input));
}

// Get client IP with more thorough checking
export function getClientIp(request: NextRequest): string {
  // Check multiple headers (Vercel, Cloudflare, etc.)
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-originating-ip',
    'cf-connecting-ip',
    'true-client-ip',
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
}

// Check if IP should be blocked
export function isIpBlocked(ip: string): boolean {
  if (ip === 'unknown') return false;

  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(ip)) {
      return true;
    }
  }
  return false;
}

// Check user agent
export function isUserAgentBlocked(userAgent: string): boolean {
  return BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

// Main security check middleware
export function securityCheck(request: NextRequest): { allowed: boolean; reason?: string; severity?: SecurityEvent["severity"] } {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;
  const query = request.nextUrl.searchParams.toString();

  // Check blocked IPs
  if (isIpBlocked(ip)) {
    logSecurityEvent({
      type: "BLOCK",
      ip,
      userAgent,
      path,
      details: "Blocked private/reserved IP range",
      severity: "medium",
    });
    return { allowed: false, reason: "IP not allowed", severity: "medium" };
  }

  // Check blocked user agents
  if (isUserAgentBlocked(userAgent)) {
    logSecurityEvent({
      type: "BLOCK",
      ip,
      userAgent,
      path,
      details: "Blocked suspicious user agent",
      severity: "medium",
    });
    return { allowed: false, reason: "User agent not allowed", severity: "medium" };
  }

  // Check for SQL injection in query params
  const allParams = path + query;
  for (const param of request.nextUrl.searchParams.values()) {
    if (detectAttack(param, "sqlInjection")) {
      logSecurityEvent({
        type: "ATTACK",
        ip,
        userAgent,
        path,
        details: `SQL injection detected in param: ${param.substring(0, 50)}`,
        severity: "critical",
      });
      return { allowed: false, reason: "Invalid input detected", severity: "critical" };
    }

    if (detectAttack(param, "xss")) {
      logSecurityEvent({
        type: "ATTACK",
        ip,
        userAgent,
        path,
        details: `XSS attack detected in param: ${param.substring(0, 50)}`,
        severity: "critical",
      });
      return { allowed: false, reason: "Invalid input detected", severity: "critical" };
    }

    if (detectAttack(param, "commandInjection")) {
      logSecurityEvent({
        type: "ATTACK",
        ip,
        userAgent,
        path,
        details: `Command injection detected in param: ${param.substring(0, 50)}`,
        severity: "critical",
      });
      return { allowed: false, reason: "Invalid input detected", severity: "critical" };
    }

    if (detectAttack(param, "pathTraversal")) {
      logSecurityEvent({
        type: "ATTACK",
        ip,
        userAgent,
        path,
        details: `Path traversal detected in param: ${param.substring(0, 50)}`,
        severity: "high",
      });
      return { allowed: false, reason: "Invalid path detected", severity: "high" };
    }

    if (detectAttack(param, "ssrf")) {
      logSecurityEvent({
        type: "ATTACK",
        ip,
        userAgent,
        path,
        details: `SSRF attempt detected in param: ${param.substring(0, 50)}`,
        severity: "high",
      });
      return { allowed: false, reason: "Invalid URL detected", severity: "high" };
    }
  }

  // Log successful access
  logSecurityEvent({
    type: "ALERT",
    ip,
    userAgent,
    path,
    details: "Request allowed",
    severity: "low",
  });

  return { allowed: true };
}

// Rate limiting with attack detection
const rateLimitStore = new Map<string, { count: number; resetTime: number; attackAttempts: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function secureRateLimit(key: string, config: { windowMs: number; maxRequests: number }): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      attackAttempts: 0,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (existing.count >= config.maxRequests) {
    existing.attackAttempts++;
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count++;
  rateLimitStore.set(key, existing);

  return {
    success: true,
    remaining: config.maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

// Get security statistics
export function getSecurityStats() {
  const now = new Date();
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  const recentEvents = securityLog.filter(e => new Date(e.timestamp) > lastHour);

  const byType = recentEvents.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySeverity = recentEvents.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byIp = recentEvents.reduce((acc, e) => {
    if (e.type === "ATTACK" || e.type === "BLOCK") {
      acc[e.ip] = (acc[e.ip] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topAttackers = Object.entries(byIp)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    totalEvents: recentEvents.length,
    byType,
    bySeverity,
    topAttackers,
    timestamp: now.toISOString(),
  };
}