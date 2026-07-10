// src/app/admin/dashboard/team/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Disable SSR for this component so it only runs in the browser
const OrgChartClient = dynamic(() => import('@/components/admin/team/OrgChartClient'), {
  ssr: false,
});

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  isRevoked: boolean;
  createdAt: string;
}

export default function TeamManagementPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const isMaster = (session?.user as { role?: string })?.role === 'Master' || 
                   (session?.user?.email === process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL);

  useEffect(() => {
    if (isMaster) fetchTeam();
  }, [isMaster]);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (data.success) setTeam(data.team);
    } catch (err) {
      console.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/admin/invite', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Team member authorized and invited successfully.' });
        setEmail(''); setName('');
        fetchTeam();
      } else {
        setStatus({ type: 'error', msg: data.error || 'Failed to authorize member.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    }
  };

  const handleAction = async (userId: string, action: 'reset-2fa' | 'toggle-revoke' | 'toggle-finance') => {
    if (!confirm('Are you sure you want to perform this administrative action?')) return;
    setStatus(null);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: data.message });
        fetchTeam();
      } else {
        setStatus({ type: 'error', msg: data.error || 'Action failed.' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'An unexpected network error occurred.' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* --- MASTER ADMIN ONLY SECTION: User Management --- */}
      {isMaster && (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team & Organization</h1>
              <p className="text-gray-500 dark:text-gray-400">View the organizational structure and manage portal access.</p>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Authorize Staff</h2>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors" placeholder="staff@jasiricup.com" />
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md mt-2">
                    Authorize Access
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500 font-bold transition-colors">
                      <tr>
                        <th className="p-4">Team Member</th>
                        <th className="p-4">Security Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
                      {loading ? (
                        <tr><td colSpan={3} className="p-8 text-center text-gray-500 dark:text-gray-400">Loading team...</td></tr>
                      ) : (
                        team.map(member => (
                          <tr key={member._id} className={`${member.isRevoked ? 'opacity-50 grayscale bg-gray-50 dark:bg-gray-800/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/20'} transition-colors`}>
                            <td className="p-4">
                              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {member.name}
                                {member.role === 'Master' && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase transition-colors">Master</span>}
                                {member.role === 'Finance' && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase transition-colors">Finance</span>}
                                {member.role === 'Admin' && <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full uppercase transition-colors">Admin</span>}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">{member.email}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1.5">
                                {member.isRevoked ? (
                                  <span className="text-xs text-red-600 dark:text-red-400 font-bold transition-colors">Access Revoked</span>
                                ) : (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-bold transition-colors">Active</span>
                                )}
                                <span className={`text-[10px] uppercase font-bold transition-colors ${member.twoFactorEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                  {member.twoFactorEnabled ? '2FA Enabled' : '2FA Pending'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {member.role !== 'Master' && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleAction(member._id, 'toggle-finance')}
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-colors ${member.role === 'Finance' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'}`}
                                  >
                                    {member.role === 'Finance' ? 'Revoke Finance' : 'Grant Finance'}
                                  </button>
                                  
                                  <button onClick={() => handleAction(member._id, 'reset-2fa')} className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                    Reset 2FA
                                  </button>
                                  <button onClick={() => handleAction(member._id, 'toggle-revoke')} className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-colors ${member.isRevoked ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                                    {member.isRevoked ? 'Restore Access' : 'Revoke Access'}
                                  </button>
                                </div>
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
          </div>
          
          {/* Visual Divider before Org Chart for the Master Admin */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"></div>
        </>
      )}

      {/* --- EVERYONE SECTION: The Org Chart --- */}
      <div>
        <OrgChartClient />
      </div>
    </div>
  );
}