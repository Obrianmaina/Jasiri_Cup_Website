// src/app/admin/dashboard/page.tsx
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2 text-sm">Here is what is happening with Jasiri Cup today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Published Blogs</h3>
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">+3 this week</span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">24</p>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Page Views</h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">1,482</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Unread Messages</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">Needs attention</span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">7</p>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/admin/blog/create"
              className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-purple-600 text-xl font-bold">+</span>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-purple-700">Write New Post</span>
            </Link>

            <Link 
              href="/admin/products"
              className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-blue-600 text-xl font-bold">📦</span>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-purple-700">Manage Products</span>
            </Link>
          </div>
        </div>

        {/* Empty State / Placeholder for recent activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No new activities to display right now.</p>
          </div>
        </div>

      </div>
    </div>
  );
}