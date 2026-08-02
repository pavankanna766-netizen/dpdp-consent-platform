import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "live",
    service: "PrivyStack Core Engine",
    timestamp: new Date().toISOString(),
  });
}
