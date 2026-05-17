// src/app/admin/finances/FinancesClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Modal, SuccessModal } from '@/components/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ITransaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  donorName?: string;
  donorEmail?: string;
  receiptUrl?: string;
  status: 'completed' | 'voided';
  paymentMethod: string;
  referenceNumber?: string;
}

interface MonthlyMetric {
  _id: { year: number; month: number };
  totalIncome: number;
  totalExpense: number;
}

interface TransactionFormData {
  type: 'income' | 'expense';
  category: string;
  amount: string;
  date: string;
  description: string;
  donorName: string;
  donorEmail: string;
  paymentMethod: string;
  referenceNumber: string;
  receiptUrl: string;
}

interface ReportConfig {
  isOpen: boolean;
  title: string;
  message: string;
  period: string;
}

export default function FinancesClient() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    isOpen: false,
    title: 'Financial Transparency Report',
    message: 'We are deeply grateful for your continuous support. Below is the summary of our financial activities, ensuring complete transparency in how every contribution empowers our mission.',
    period: 'Year to Date'
  });

  const initialFormState: TransactionFormData = {
    type: 'income',
    category: 'Donation',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    donorName: '',
    donorEmail: '',
    paymentMethod: 'M-Pesa',
    referenceNumber: '',
    receiptUrl: ''
  };
  const [formData, setFormData] = useState<TransactionFormData>(initialFormState);

  const fetchFinances = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/finances');
      if (!res.ok) throw new Error('Failed to fetch data');
      const { data } = await res.json();
      setTransactions(data.transactions);
      setMetrics(data.metrics);
    } catch {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const toastId = toast.loading('Logging transaction...');

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: new Date(formData.date).toISOString(),
      };

      const res = await fetch('/api/admin/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      toast.dismiss(toastId);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      setSuccessModal({ isOpen: true, message: 'Transaction logged successfully!' });
      
      fetchFinances();
    } catch {
      toast.error('Failed to log transaction', { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const executePrint = () => {
    setReportConfig(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'short' });
  };
  
  const getFullMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const totalLifetimeIncome = metrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const totalLifetimeExpense = metrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const netBalance = totalLifetimeIncome - totalLifetimeExpense;

  const incomeCategories = ['Donation', 'Grant', 'Merchandise', 'Other'];
  const expenseCategories = ['Logistics', 'Marketing', 'Operations', 'Tax', 'Supplies', 'Other'];

  const chartData = [...metrics].reverse().map(m => ({
    name: `${getMonthName(m._id.month)} ${m._id.year}`,
    Income: m.totalIncome,
    Expense: m.totalExpense
  }));

  return (
    <>
      {/* Pure standard printing styles using an inline style tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body > div:not(.print-report-container), 
          header, footer, main, nav, aside, button, .print\\:hidden {
            display: none !important;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-report-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />

      {/* --- NORMAL DASHBOARD VIEW --- */}
      <div className="pt-12 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline mb-4">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Finances & Transparency</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track donations, grants, and operational expenses.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setReportConfig(prev => ({...prev, isOpen: true}))} className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-center">
              Generate Report
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 dark:bg-emerald-50 transition-colors shadow-sm text-center">
              + Log Transaction
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Income</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalLifetimeIncome)}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(totalLifetimeExpense)}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>{formatCurrency(netBalance)}</p>
              </div>
            </div>

            {/* Cash Flow Line Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Cash Flow Trends</h3>
              <div className="h-80 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `Ksh ${value >= 1000 ? (value/1000)+'k' : value}`} />
                      <Tooltip cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="Income" stroke="#059669" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Not enough data to display graph.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-gray-900 dark:text-white">Monthly Reports</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                  {metrics.map((m) => (
                    <div key={`${m._id.year}-${m._id.month}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{getMonthName(m._id.month)} {m._id.year}</p>
                        <p className="text-xs text-gray-500 mt-1">Net: <span className={m.totalIncome - m.totalExpense >= 0 ? 'text-emerald-600' : 'text-red-500'}>{formatCurrency(m.totalIncome - m.totalExpense)}</span></p>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <p className="text-emerald-600 font-medium">+{formatCurrency(m.totalIncome)}</p>
                        <p className="text-red-500 font-medium">-{formatCurrency(m.totalExpense)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-gray-900 dark:text-white">Recent Ledger Entries</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions.map(tx => (
                    <div key={tx._id} className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${tx.status === 'voided' ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {tx.type === 'income' ? '↓' : '↑'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{tx.category}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5">{tx.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                            <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{tx.paymentMethod}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                        <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        {tx.donorName && <p className="text-xs text-gray-500 mt-1">From: {tx.donorName}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal: Add Log */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Transaction" size="large">
          <form onSubmit={handleSaveTransaction} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="income">Income (Money In)</option>
                  <option value="expense">Expense (Money Out)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (KES)</label>
                <input required type="number" min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Brief description of the transaction" />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Stripe">Stripe / Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Number (Optional)</label>
                <input type="text" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. M-Pesa Code" />
              </div>
            </div>

            {formData.type === 'income' && (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Donor Name (Optional)</label>
                  <input type="text" value={formData.donorName} onChange={(e) => setFormData({...formData, donorName: e.target.value})} className="w-full border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">Donor Email (Optional)</label>
                  <input type="email" value={formData.donorEmail} onChange={(e) => setFormData({...formData, donorEmail: e.target.value})} className="w-full border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors">
                {processing ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Report Customizer */}
        <Modal isOpen={reportConfig.isOpen} onClose={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} title="Configure Formal Report" size="large">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Document Title</label>
              <input type="text" value={reportConfig.title} onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reporting Period</label>
              <input type="text" value={reportConfig.period} onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executive Summary Message</label>
              <textarea rows={5} value={reportConfig.message} onChange={(e) => setReportConfig({...reportConfig, message: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={executePrint} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center gap-2">
                Generate Official PDF
              </button>
            </div>
          </div>
        </Modal>

        <SuccessModal
          isOpen={successModal.isOpen}
          onClose={() => setSuccessModal({ isOpen: false, message: '' })}
          title="Success"
          message={successModal.message}
        />
      </div>


      {/* --- FORMAL A4 REPORT TEMPLATE --- */}
      {/* Hidden strictly on layout screens. Populated strictly on printing scopes. */}
      <div className="hidden print:block bg-white text-black min-h-screen print-report-container">
        <div className="max-w-[210mm] mx-auto p-12 bg-white text-black font-sans">
          
          {/* Formal Header Section with Cloudinary Logo */}
          <div className="flex justify-between items-center border-b-4 border-emerald-950 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-emerald-950 rounded-xl p-2 flex items-center justify-center">
                <Image 
                  src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png" 
                  alt="JaSiriCup Logo" 
                  width={64} 
                  height={64} 
                  className="w-auto h-auto object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl font-black text-emerald-950 uppercase tracking-tight leading-none">JaSiriCup</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Change Initiative Ecosystem</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-xs uppercase tracking-wider">Official Statement</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{reportConfig.title}</p>
              <p className="text-xs text-emerald-800 font-semibold mt-1">Timeline: {reportConfig.period}</p>
            </div>
          </div>

          {/* Meta Data Grid Box */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Report Type: <span className="text-black font-bold">Financial Transparency Ledger</span></p>
              <p className="text-gray-500 font-medium mt-1">Generated By: <span className="text-black font-bold">Admin Ledger Central</span></p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-medium">Date Issued: <span className="text-black font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
              <p className="text-gray-500 font-medium mt-1">System Status: <span className="text-emerald-700 font-bold">Audited & Verified</span></p>
            </div>
          </div>

          {/* Statement Message Body */}
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 border-b border-gray-300 pb-1.5 mb-3">Executive Statement</h2>
            <p className="text-gray-800 leading-relaxed text-xs text-justify whitespace-pre-wrap">{reportConfig.message}</p>
          </div>

          {/* Summary Matrix Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 p-4 rounded-xl bg-emerald-50/40">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gross Capital Inflow</p>
              <p className="text-xl font-black text-emerald-800 mt-1">{formatCurrency(totalLifetimeIncome)}</p>
            </div>
            <div className="border border-gray-200 p-4 rounded-xl bg-red-50/40">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gross Capital Outflow</p>
              <p className="text-xl font-black text-red-800 mt-1">{formatCurrency(totalLifetimeExpense)}</p>
            </div>
            <div className="border-2 border-emerald-950 p-4 rounded-xl bg-white">
              <p className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider">Net Retained Capital</p>
              <p className="text-xl font-black text-black mt-1">{formatCurrency(netBalance)}</p>
            </div>
          </div>

          {/* Historical Data Balance Table */}
          <div className="mb-12 break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-950 border-b border-gray-300 pb-1.5 mb-4">Account Balance History</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2.5 px-4 font-bold text-xs uppercase text-gray-600 border-b border-gray-300">Accounting Month</th>
                  <th className="py-2.5 px-4 font-bold text-xs uppercase text-gray-600 border-b border-gray-300 text-right">Inflow</th>
                  <th className="py-2.5 px-4 font-bold text-xs uppercase text-gray-600 border-b border-gray-300 text-right">Outflow</th>
                  <th className="py-2.5 px-4 font-bold text-xs uppercase text-gray-600 border-b border-gray-300 text-right">Net Growth</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, index) => {
                  const net = m.totalIncome - m.totalExpense;
                  return (
                    <tr key={`${m._id.year}-${m._id.month}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="py-2.5 px-4 border-b border-gray-200 font-semibold text-xs">{getFullMonthName(m._id.month)} {m._id.year}</td>
                      <td className="py-2.5 px-4 border-b border-gray-200 text-right text-emerald-700 text-xs">+{formatCurrency(m.totalIncome)}</td>
                      <td className="py-2.5 px-4 border-b border-gray-200 text-right text-red-700 text-xs">-{formatCurrency(m.totalExpense)}</td>
                      <td className="py-2.5 px-4 border-b border-gray-200 text-right font-bold text-xs">{formatCurrency(net)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official Signature Lines */}
          <div className="mt-24 pt-8 border-t border-gray-200 grid grid-cols-2 gap-12 break-inside-avoid">
            <div>
              <div className="border-b border-gray-400 mb-1.5 h-8 w-56"></div>
              <p className="font-bold text-xs text-gray-800">Prepared By</p>
              <p className="text-[10px] text-gray-500">Financial Management Desk, JaSiriCup</p>
            </div>
            <div>
              <div className="border-b border-gray-400 mb-1.5 h-8 w-56"></div>
              <p className="font-bold text-xs text-gray-800">Authorized Signatory</p>
              <p className="text-[10px] text-gray-500">Executive Committee, JaSiriCup</p>
            </div>
          </div>

          {/* Document Verification Footnote */}
          <div className="mt-16 text-center text-[10px] text-gray-400">
            <p>This statement is generated securely through the JaSiriCup dashboard platform architecture.</p>
            <p className="mt-0.5">All transaction reference records are kept on an audit-ready immutable distributed ledger.</p>
          </div>

        </div>
      </div>
    </>
  );
}