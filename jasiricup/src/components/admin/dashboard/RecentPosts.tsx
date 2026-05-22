import Link from "next/link";

interface IRecentPost {
  _id: string;
  title: string;
  status: string;
  createdAt?: Date;
  viewCount?: number;
}

export function RecentPosts({ posts }: { posts: IRecentPost[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Recent Posts</h2>
        <Link href="/admin/blog" className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
          View all &rarr;
        </Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
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
  );
}