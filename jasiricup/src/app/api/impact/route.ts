// src/app/api/impact/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Order from '@/lib/models/Order';
import SiteContent from '@/lib/models/SiteContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Pull dynamic stats from orders + site content
    const [orderCount, siteStats] = await Promise.all([
      Order.countDocuments({ status: { $ne: 'cancelled' } }),
      SiteContent.findOne({ page: 'impact', section: 'stats' }),
    ]);

    // Base stats (can be overridden via admin > Page Content > impact)
    const overrides = siteStats?.content ?? {};

    const stats = {
      cupsDonated:     overrides.cupsDonated     ?? Math.max(5000, orderCount * 1),
      girlsImpacted:   overrides.girlsImpacted   ?? Math.max(12000, orderCount * 2),
      schoolsReached:  overrides.schoolsReached  ?? 45,
      countiesReached: overrides.countiesReached ?? 8,
      periodsManaged:  overrides.periodsManaged  ?? Math.max(60000, orderCount * 12),
      volunteersActive:overrides.volunteersActive?? 120,
    };

    return NextResponse.json(
      { success: true, stats },
      { status: 200 }
    );
  } catch (error) {
    console.error('Impact stats error:', error);
    return NextResponse.json(
      {
        success: true,
        stats: {
          cupsDonated: 5000,
          girlsImpacted: 12000,
          schoolsReached: 45,
          countiesReached: 8,
          periodsManaged: 60000,
          volunteersActive: 120,
        },
      },
      { status: 200 },
    );
  }
}