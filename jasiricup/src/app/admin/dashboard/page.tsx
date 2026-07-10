// src/app/admin/dashboard/page.tsx
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RecentPosts } from "@/components/admin/dashboard/RecentPosts";

export const dynamic = 'force-dynamic';

interface IRecentPost {
  _id: string;
  title: string;
  status: string;
  createdAt?: Date;
  viewCount?: number;
}

async function getDashboardStats() {
  try {
    await connectDB();
    
    // Fetch only blog-related stats now
    const [totalBlogs, publishedBlogs, draftBlogs, totalViews] = await Promise.all([
      BlogPost.countDocuments({}),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
    ]);
    
    const recentPosts = (await BlogPost.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt viewCount')
      .lean()) as unknown as IRecentPost[];

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews: totalViews[0]?.total || 0,
      recentPosts,
    };
  } catch {
    return { totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0, totalViews: 0, recentPosts: [] };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">Here is what is happening with Jasiri Cup today.</p>
      </div>
      
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentPosts posts={stats.recentPosts} />
      </div>
    </div>
  );
}