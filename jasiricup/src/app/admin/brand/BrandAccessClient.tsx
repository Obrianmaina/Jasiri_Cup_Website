// src/app/admin/brand/BrandAccessClient.tsx
"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import Link from 'next/dist/client/link';

interface RequestData {
  _id: string;
  email: string;
  name?: string;
  organization?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function BrandAccessClient() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // Append a timestamp to the URL to completely bypass browser caching
      const res = await fetch(`/api/admin/brand-access?_t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequests(data.requests);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/brand-access/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Request ${newStatus} successfully`);
      fetchRequests(); // Refresh the list
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading requests...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl px-4 py-16 w-full mx-auto">

      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">Brand Guidelines and Access</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Manage your brand guidelines and access requests.</p>
      </div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Brand Access Requests</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 text-sm text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">User Info</th>
                <th className="p-4 font-medium">Purpose</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 dark:text-white">{req.email}</div>
                      <div className="text-sm text-gray-500">
                        {[req.name, req.organization].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-sm max-w-xs truncate" title={req.purpose}>
                      {req.purpose}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${req.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleUpdateStatus(req._id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}