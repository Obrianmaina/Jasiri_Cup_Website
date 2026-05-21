// src/app/admin/dashboard/page.tsx
import Link from "next/link";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import ContactMessage from "@/lib/models/ContactMessage";
import { FilePlus, Layout, ShoppingBag, Mail, HelpCircle, Wallet, BarChart, Palette } from "lucide-react";

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
    const [totalBlogs, publishedBlogs, draftBlogs, totalMessages, totalViews] = await Promise.all([
      BlogPost.countDocuments({}),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.countDocuments({ status: 'draft' }),
      ContactMessage.countDocuments({}),
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
      totalMessages,
      totalViews: totalViews[0]?.total || 0,
      recentPosts,
    };
  } catch {
    return {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalMessages: 0,
      totalViews: 0,
      recentPosts: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">Here is what is happening with Jasiri Cup today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Published Posts</h3>
            <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Live</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.publishedBlogs}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Draft Posts</h3>
            <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Draft</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.draftBlogs}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Total Views</h3>
            <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">All time</span>
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm">Messages</h3>
            {stats.totalMessages > 0 && (
              <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full hidden sm:inline">Inbox</span>
            )}
          </div>
          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{stats.totalMessages}</p>
        </div>
      </div>

      {/* Quick Actions & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 transition-colors">
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <Link 
              href="/admin/blog/create"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                <FilePlus size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">New Post</h3>
                <p className="text-xs text-gray-500">Draft a new article</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/pages"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
                <Layout size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Pages</h3>
                <p className="text-xs text-gray-500">Manage site content</p>
              </div>
            </Link>

            <Link 
              href="/admin/products"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-lg group-hover:scale-105 transition-transform">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Products</h3>
                <p className="text-xs text-gray-500">Manage inventory</p>
              </div>
            </Link>

            <Link 
              href="/admin/messages"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-amber-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg group-hover:scale-105 transition-transform">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Messages</h3>
                <p className="text-xs text-gray-500">View submissions</p>
              </div>
            </Link>

            <Link 
              href="/admin/faq"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">FAQs</h3>
                <p className="text-xs text-gray-500">Update questions</p>
              </div>
            </Link>

            <Link 
              href="/admin/finances"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Finances</h3>
                <p className="text-xs text-gray-500">Track revenue</p>
              </div>
            </Link>

            <Link 
              href="/admin/impact"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-cyan-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-lg group-hover:scale-105 transition-transform">
                <BarChart size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Impact</h3>
                <p className="text-xs text-gray-500">Update metrics</p>
              </div>
            </Link>

            <Link 
              href="/admin/brand"
              className="group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-yellow-500 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4"
            >
              <div className="p-3 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg group-hover:scale-105 transition-transform">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Brand OS</h3>
                <p className="text-xs text-gray-500">Review requests</p>
              </div>
            </Link>

          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link href="/admin/blog" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
              View all &rarr;
            </Link>
          </div>
          
          {stats.recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentPosts.map((post) => (
                <div key={String(post._id)} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{post.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      {' • '}{post.viewCount || 0} views
                    </p>
                  </div>
                  <span className={`ml-3 shrink-0 px-2 py-0.5 text-xs font-semibold rounded-md ${
                    post.status === 'published' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {post.status === 'published' ? 'Live' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}