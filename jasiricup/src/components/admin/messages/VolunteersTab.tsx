import React from 'react';
import { IVolunteer } from '@/types/admin-messages';

interface Props {
  volunteers: IVolunteer[];
  processingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  onReply: (email: string, name: string, subject: string) => void;
  onDelete: (id: string) => void;
}

export default function VolunteersTab({ volunteers, processingId, onUpdateStatus, onReply, onDelete }: Props) {
  if (volunteers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No volunteer applications found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {volunteers.map((vol) => (
        <div key={vol._id} className={`bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border transition-colors ${vol.status === 'pending' ? 'border-purple-300 dark:border-purple-700' : 'border-gray-100 dark:border-gray-800'}`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vol.name}</h3>
                {vol.status === 'pending' && <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending</span>}
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm">
                <a href={`mailto:${vol.email}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 break-all">{vol.email}</a>
                <a href={`tel:${vol.phone}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">{vol.phone}</a>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <select 
                value={vol.status}
                onChange={(e) => onUpdateStatus(vol._id, e.target.value)}
                disabled={processingId === vol._id}
                className="text-sm md:text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 md:px-2 md:py-1.5 focus:ring-purple-500 focus:border-purple-500 transition-colors w-full sm:w-auto"
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
              </select>
              <div className="flex w-full sm:w-auto gap-2">
                <button 
                  onClick={() => onReply(vol.email, vol.name, 'Thank you for your interest in Volunteering')}
                  className="flex-1 sm:flex-none text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors text-center"
                >
                  Reply
                </button>
                <button 
                  onClick={() => onDelete(vol._id)}
                  disabled={processingId === vol._id}
                  className="flex-1 sm:flex-none text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">Interested Roles</span>
            <div className="flex flex-wrap gap-2">
              {vol.roles.map((role, idx) => (
                <span key={idx} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/50 px-2.5 py-1 rounded-md text-xs font-semibold">
                  {role}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Message</span>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                {new Date(vol.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap transition-colors">
              {vol.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}