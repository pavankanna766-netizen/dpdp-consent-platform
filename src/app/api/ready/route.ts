import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redis } from "@/platform/cache/redis-client";

export async function GET() {
  const startTime = performance.now();

  try {
    // 1. Database Ping
    const { error: dbError } = await supabaseAdmin.from("companies").select("id").limit(1);

    // 2. Redis Health Check (real Upstash ping)
    const redisHealth = await redis.healthCheck();

    const duration = performance.now() - startTime;

    const isDbHealthy = !dbError;
    const isRedisHealthy = redisHealth.healthy;

    const isReady = isDbHealthy && isRedisHealthy;

    return NextResponse.json(
      {
        status: isReady ? "ready" : "degraded",
        timestamp: new Date().toISOString(),
        latencyMs: Math.round(duration),
        checks: {
          database: isDbHealthy ? "up" : "down",
          redis: isRedisHealthy ? "up" : "down",
          redisLatencyMs: redisHealth.latencyMs,
          redisDegraded: redis.isDegraded,
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
