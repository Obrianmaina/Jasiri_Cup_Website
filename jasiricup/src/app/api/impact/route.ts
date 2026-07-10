// src/app/api/impact/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import SiteContent from '@/lib/models/SiteContent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Pull dynamic stats from site content only
    const siteStats = await SiteContent.findOne({ page: 'impact', section: 'stats' });

    // Base stats (can be overridden via admin > Page Content > impact)
    const overrides = siteStats?.content ?? {};

    const stats = {
      cupsDonated:     overrides.cupsDonated     ?? 5000,
      girlsImpacted:   overrides.girlsImpacted   ?? 12000,
      schoolsReached:  overrides.schoolsReached  ?? 45,
      countiesReached: overrides.countiesReached ?? 8,
      periodsManaged:  overrides.periodsManaged  ?? 60000,
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