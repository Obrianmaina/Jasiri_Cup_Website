// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/dbConnect';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbHealthy = await checkDatabaseHealth();

  const status = dbHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? 'unknown',
      services: {
        database: dbHealthy ? 'connected' : 'disconnected',
      },
    },
    { status }
  );
}