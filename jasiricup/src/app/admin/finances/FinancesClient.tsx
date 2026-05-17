// src/app/admin/finances/FinancesClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Modal, SuccessModal } from '@/components/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialReportTemplate } from '@/components/admin/FinancialReportTemplate';

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
  periodFilter: string;
  periodLabel: string;
  preparedBy: string;
  preparedBySignature: string;
  authorizedSignatorySignature: string;
}

export default function FinancesClient() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [uploadingSig, setUploadingSig] = useState<'preparedBy' | 'authorized' | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    isOpen: false,
    title: 'Financial Transparency Report',
    message: 'We are deeply grateful for your continuous support. Below is the summary of our financial activities, ensuring complete transparency in how every contribution empowers our mission.',
    periodFilter: 'all',
    periodLabel: 'Lifetime / All-Time Record',
    preparedBy: 'Admin Ledger Central',
    preparedBySignature: '',
    authorizedSignatorySignature: ''
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

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'preparedBySignature' | 'authorizedSignatorySignature') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSig(target === 'preparedBySignature' ? 'preparedBy' : 'authorized');
    const toastId = toast.loading('Uploading signature...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        setReportConfig(prev => ({ ...prev, [target]: data.url }));
        toast.success('Signature uploaded!', { id: toastId });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload signature', { id: toastId });
    } finally {
      setUploadingSig(null);
      e.target.value = ''; // Reset input
    }
  };

  const executePrint = async () => {
    // 1. Generate unique file name: Jasiricup_YYYYMMDD_RANDOM
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const uniqueFileName = `Jasiricup_${dateStr}_${randomCode}`;

    // 2. Save it to state so the template can print it on the document
    setReportConfig(prev => ({ ...prev, isOpen: false, reportId: uniqueFileName }));
    
    // 3. Silently save the log to MongoDB
    try {
      await fetch('/api/admin/report-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: uniqueFileName,
          title: reportConfig.title,
          periodLabel: reportConfig.periodLabel || 'Lifetime / All-Time Record',
          preparedBy: reportConfig.preparedBy,
          totalIncome: reportIncome,
          totalExpense: reportExpense,
          netBalance: reportNet
        })
      });
    } catch (error) {
      console.error("Non-fatal error: Failed to save report log to DB", error);
    }
    
    // 4. Wait for modal to close, change document title, and trigger print
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = uniqueFileName; 
      
      window.print();
      
      document.title = originalTitle; 
    }, 400); // Slightly increased timeout to ensure state and DB complete smoothly
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

  const handleFilterChange = (val: string) => {
    let newLabel = 'Lifetime / All-Time Record';
    if (val !== 'all') {
      const [year, month] = val.split('-');
      newLabel = `${getFullMonthName(parseInt(month))} ${year}`;
    }
    setReportConfig({ ...reportConfig, periodFilter: val, periodLabel: newLabel });
  };

  const totalLifetimeIncome = metrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const totalLifetimeExpense = metrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const netBalance = totalLifetimeIncome - totalLifetimeExpense;

  const filteredMetrics = reportConfig.periodFilter === 'all' 
    ? metrics 
    : metrics.filter(m => `${m._id.year}-${m._id.month}` === reportConfig.periodFilter);

  const filteredTransactions = reportConfig.periodFilter === 'all'
    ? transactions
    : transactions.filter(tx => {
        const d = new Date(tx.date);
        return `${d.getFullYear()}-${d.getMonth() + 1}` === reportConfig.periodFilter;
      });

  const reportIncome = filteredMetrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const reportExpense = filteredMetrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const reportNet = reportIncome - reportExpense;

  const incomeCategories = ['Donation', 'Grant', 'Merchandise', 'Other'];
  const expenseCategories = ['Logistics', 'Marketing', 'Operations', 'Tax', 'Supplies', 'Other'];

  const chartData = [...metrics].reverse().map(m => ({
    name: `${getMonthName(m._id.month)} ${m._id.year}`,
    Income: m.totalIncome,
    Expense: m.totalExpense
  }));

  return (
    <>
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
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 dark:bg-emerald-500 transition-colors shadow-sm text-center">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Document Title</label>
                <input type="text" value={reportConfig.title} onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prepared By (Name / Role)</label>
                <input type="text" value={reportConfig.preparedBy} onChange={(e) => setReportConfig({...reportConfig, preparedBy: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. John Doe, Treasurer" />
              </div>
            </div>

            {/* NEW: Dynamic Signatures Uploader */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prepared By Signature</label>
                {reportConfig.preparedBySignature ? (
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <img src={reportConfig.preparedBySignature} alt="Signature" className="h-8 object-contain" />
                    <button type="button" onClick={() => setReportConfig(p => ({...p, preparedBySignature: ''}))} className="text-red-500 text-xs font-semibold hover:underline ml-auto">Remove</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => handleSignatureUpload(e, 'preparedBySignature')} disabled={uploadingSig === 'preparedBy'} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer disabled:opacity-50" />
                    {uploadingSig === 'preparedBy' && <span className="absolute right-2 top-2 text-xs text-purple-600 animate-pulse">Uploading...</span>}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authorized Signatory</label>
                {reportConfig.authorizedSignatorySignature ? (
                  <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <img src={reportConfig.authorizedSignatorySignature} alt="Signature" className="h-8 object-contain" />
                    <button type="button" onClick={() => setReportConfig(p => ({...p, authorizedSignatorySignature: ''}))} className="text-red-500 text-xs font-semibold hover:underline ml-auto">Remove</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={(e) => handleSignatureUpload(e, 'authorizedSignatorySignature')} disabled={uploadingSig === 'authorized'} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer disabled:opacity-50" />
                    {uploadingSig === 'authorized' && <span className="absolute right-2 top-2 text-xs text-purple-600 animate-pulse">Uploading...</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Data Filter</label>
                <select 
                  value={reportConfig.periodFilter} 
                  onChange={(e) => handleFilterChange(e.target.value)} 
                  className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All-Time Lifetime Record</option>
                  {metrics.map(m => (
                    <option key={`${m._id.year}-${m._id.month}`} value={`${m._id.year}-${m._id.month}`}>
                      {getFullMonthName(m._id.month)} {m._id.year}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Printed Timeline Label</label>
                <input 
                  type="text" 
                  value={reportConfig.periodLabel} 
                  onChange={(e) => setReportConfig({...reportConfig, periodLabel: e.target.value})} 
                  className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="e.g. Q1 2026 or Annual Report" 
                />
              </div>
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

      <FinancialReportTemplate 
        config={{
          title: reportConfig.title,
          message: reportConfig.message,
          periodLabel: reportConfig.periodLabel,
          preparedBy: reportConfig.preparedBy,
          preparedBySignature: reportConfig.preparedBySignature,
          authorizedSignatorySignature: reportConfig.authorizedSignatorySignature
        }}
        metrics={filteredMetrics}
        transactions={filteredTransactions}
        totals={{
          income: reportIncome,
          expense: reportExpense,
          net: reportNet
        }}
        formatCurrency={formatCurrency}
        getFullMonthName={getFullMonthName}
      />
    </>
  );
}