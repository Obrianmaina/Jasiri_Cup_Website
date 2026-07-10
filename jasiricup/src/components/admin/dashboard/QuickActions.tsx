import Link from "next/link";
import { FilePlus, Layout, ShoppingBag, HelpCircle, Wallet, BarChart, Palette } from "lucide-react";

const ACTIONS = [
  { href: "/admin/blog/create", icon: FilePlus, title: "New Post", desc: "Draft a new article", wrapperClass: "hover:border-purple-500", iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", titleClass: "group-hover:text-purple-600 dark:group-hover:text-purple-400" },
  { href: "/admin/pages", icon: Layout, title: "Pages", desc: "Manage site content", wrapperClass: "hover:border-blue-500", iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", titleClass: "group-hover:text-blue-600 dark:group-hover:text-blue-400" },
  { href: "/admin/products", icon: ShoppingBag, title: "Products", desc: "Manage inventory", wrapperClass: "hover:border-green-500", iconClass: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", titleClass: "group-hover:text-green-600 dark:group-hover:text-green-400" },
  { href: "/admin/faq", icon: HelpCircle, title: "FAQs", desc: "Update questions", wrapperClass: "hover:border-indigo-500", iconClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", titleClass: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400" },
  { href: "/admin/finances", icon: Wallet, title: "Finances", desc: "Track revenue", wrapperClass: "hover:border-emerald-500", iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", titleClass: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400" },
  { href: "/admin/impact", icon: BarChart, title: "Impact", desc: "Update metrics", wrapperClass: "hover:border-cyan-500", iconClass: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400", titleClass: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400" },
  { href: "/admin/brand", icon: Palette, title: "Brand OS", desc: "Review requests", wrapperClass: "hover:border-yellow-500", iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", titleClass: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400" },
];

export function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 transition-colors">
      <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href} className={`group p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow transition-all flex items-center gap-4 ${action.wrapperClass}`}>
              <div className={`p-3 rounded-lg group-hover:scale-105 transition-transform ${action.iconClass}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className={`font-semibold text-sm text-gray-900 dark:text-white transition-colors ${action.titleClass}`}>
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}