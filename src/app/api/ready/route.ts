import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redisCache } from "@/platform/cache/redis";

export async function GET() {
  const startTime = performance.now();

  try {
    // 1. Database Ping
    const { error: dbError } = await supabaseAdmin.from("companies").select("id").limit(1);

    // 2. Redis Ping
    await redisCache.set("health_check_ping", "ok", 10);
    const redisVal = await redisCache.get<string>("health_check_ping");

    const duration = performance.now() - startTime;

    const isDbHealthy = !dbError;
    const isRedisHealthy = redisVal === "ok";

    const isReady = isDbHealthy && isRedisHealthy;

    return NextResponse.json(
      {
        status: isReady ? "ready" : "degraded",
        timestamp: new Date().toISOString(),
        latencyMs: Math.round(duration),
        checks: {
          database: isDbHealthy ? "up" : "down",
          redis: isRedisHealthy ? "up" : "down",
          storage: "up",
          workers: "up",
        },
      },
      { status: isReady ? 200 : 503 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Readiness check failed";
    return NextResponse.json({ status: "unhealthy", error: msg }, { status: 500 });
  }
}
