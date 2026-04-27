import { NextRequest, NextResponse } from "next/server";
import { getSecurityLog, getSecurityStats, clearSecurityLog, getClientIp } from "@/lib/security";
import { secureRateLimit } from "@/lib/security";

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);

  const limit = secureRateLimit(`security-${clientIp}`, { windowMs: 60000, maxRequests: 10 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  if (action === "stats") {
    return NextResponse.json(getSecurityStats());
  }

  if (action === "clear") {
    clearSecurityLog();
    return NextResponse.json({ success: true, message: "Security logs cleared" });
  }

  const eventLimit = parseInt(url.searchParams.get("limit") || "100");
  const events = getSecurityLog().slice(-eventLimit);

  return NextResponse.json({ events, count: events.length });
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);

  const limit = secureRateLimit(`security-alert-${clientIp}`, { windowMs: 60000, maxRequests: 5 });
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { alertType, config } = body;

    switch (alertType) {
      case "configure":
        console.log("[SECURITY] Alert configured:", config);
        return NextResponse.json({ success: true, message: "Alert configuration updated" });
      case "test":
        console.log("[SECURITY ALERT] Test alert triggered from", clientIp);
        return NextResponse.json({ success: true, message: "Test alert sent" });
      case "stats":
        return NextResponse.json(getSecurityStats());
      default:
        return NextResponse.json({ error: "Invalid alert type" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}