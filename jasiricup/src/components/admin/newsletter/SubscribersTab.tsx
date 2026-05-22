import React from 'react';

export interface ISubscriber {
  _id: string;
  email: string;
  status?: string;
  createdAt: string;
}

interface Props {
  subscribers: ISubscriber[];
  isLoading: boolean;
}

export function SubscribersTab({ subscribers, isLoading }: Props) {
  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading subscribers...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        <h3 className="font-bold text-gray-900 dark:text-white flex justify-between items-center">
          Subscriber Roster
          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full">
            {subscribers.length} Total
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
              <th className="p-4 font-medium">Email Address</th>
              <th className="p-4 font-medium">Join Date</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No subscribers yet.</td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{sub.email}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      sub.status === 'unsubscribed' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {sub.status || 'Subscribed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}