import { NextRequest, NextResponse } from "next/server";
import { getSecurityStats } from "@/lib/security";

/**
 * Health check endpoint for container orchestration (Docker/Kubernetes)
 * Supports both readiness and liveness probes
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const includeSecurity = url.searchParams.get("security") === "true";

  const healthcheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
    version: process.env.npm_package_version || "1.0.0",
  };

  if (includeSecurity) {
    return NextResponse.json({
      ...healthcheck,
      security: getSecurityStats(),
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  return NextResponse.json(healthcheck, {
    status: 200,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}