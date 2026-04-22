import { NextResponse } from "next/server";

/**
 * Health check endpoint for container orchestration (Docker/Kubernetes)
 * Supports both readiness and liveness probes
 */
export async function GET() {
  // Basic health check - verify the app is running
  const healthcheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 0,
  };

  return NextResponse.json(healthcheck, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}