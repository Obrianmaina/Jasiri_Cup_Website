// src/app/admin/finances/FinancesClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Modal, SuccessModal } from '@/components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Strict Types
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

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  // Report Builder State
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    isOpen: false,
    title: 'Financial Transparency Report',
    message: 'We are deeply grateful for your continuous support. Below is the summary of our financial activities, ensuring complete transparency in how every contribution empowers our mission.',
    period: 'All Time'
  });

  // Form State
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
    // A small timeout ensures the modal closes before the browser takes a screenshot of the DOM
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  // Calculations
  const totalLifetimeIncome = metrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const totalLifetimeExpense = metrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const netBalance = totalLifetimeIncome - totalLifetimeExpense;

  const incomeCategories = ['Donation', 'Grant', 'Merchandise', 'Other'];
  const expenseCategories = ['Logistics', 'Marketing', 'Operations', 'Tax', 'Supplies', 'Other'];

  // Prepare Chart Data (Chronological order: oldest to newest)
  const chartData = [...metrics].reverse().map(m => ({
    name: `${getMonthName(m._id.month)} ${m._id.year}`,
    Income: m.totalIncome,
    Expense: m.totalExpense
  }));

  return (
    <>
      {/* --- NORMAL DASHBOARD VIEW (Hidden during print) --- */}
      <div className="pt-12 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 print:hidden">
        
        {/* Header */}
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
              Export Report
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
            {/* Summary Cards */}
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

            {/* Cash Flow Graph */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Cash Flow Overview</h3>
              <div className="h-72 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `Ksh ${value >= 1000 ? (value/1000)+'k' : value}`} />
                      <Tooltip cursor={{ fill: '#374151', opacity: 0.1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">Not enough data to display graph.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Breakdown Table */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-gray-900 dark:text-white">Monthly Reports</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                  {metrics.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500 text-center">No data available.</p>
                  ) : (
                    metrics.map((m) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="font-bold text-gray-900 dark:text-white">Recent Ledger Entries</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No transactions recorded yet.</div>
                  ) : (
                    transactions.map(tx => (
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
                              {tx.status === 'voided' && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">VOIDED</span>}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Transaction Modal */}
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

        {/* Report Builder Modal */}
        <Modal isOpen={reportConfig.isOpen} onClose={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} title="Configure Report" size="large">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Title</label>
              <input type="text" value={reportConfig.title} onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period / Subtitle</label>
              <input type="text" value={reportConfig.period} onChange={(e) => setReportConfig({...reportConfig, period: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Year End 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executive Summary / Message</label>
              <textarea rows={5} value={reportConfig.message} onChange={(e) => setReportConfig({...reportConfig, message: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Enter a message to your donors..." />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={executePrint} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors flex items-center gap-2">
                Export to PDF
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


      {/* --- PRINTABLE REPORT VIEW (Hidden on screen, Visible only in PDF/Print) --- */}
      <div className="hidden print:block w-full max-w-4xl mx-auto bg-white text-black p-8 font-sans">
        
        {/* Report Header */}
        <div className="border-b-2 border-black pb-6 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight uppercase">JasiriCup</h1>
            <p className="text-lg font-bold text-gray-600 mt-1">{reportConfig.title}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-800">Date Generated</p>
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-gray-500 mt-1">Period: {reportConfig.period}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-10">
          <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Executive Summary</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{reportConfig.message}</p>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="border-2 border-gray-200 p-4 rounded-lg">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Income</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalLifetimeIncome)}</p>
          </div>
          <div className="border-2 border-gray-200 p-4 rounded-lg">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-black text-red-700 mt-1">{formatCurrency(totalLifetimeExpense)}</p>
          </div>
          <div className="border-2 border-black bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-bold text-black uppercase tracking-wider">Net Balance</p>
            <p className="text-2xl font-black text-black mt-1">{formatCurrency(netBalance)}</p>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Monthly Breakdown</h2>
        <table className="w-full text-left border-collapse mb-10">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-3 px-4 font-bold text-sm uppercase">Month / Year</th>
              <th className="py-3 px-4 font-bold text-sm uppercase text-right">Income</th>
              <th className="py-3 px-4 font-bold text-sm uppercase text-right">Expense</th>
              <th className="py-3 px-4 font-bold text-sm uppercase text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const net = m.totalIncome - m.totalExpense;
              return (
                <tr key={`${m._id.year}-${m._id.month}`} className="border-b border-gray-200">
                  <td className="py-3 px-4 font-medium">{getMonthName(m._id.month)} {m._id.year}</td>
                  <td className="py-3 px-4 text-right text-emerald-700">+{formatCurrency(m.totalIncome)}</td>
                  <td className="py-3 px-4 text-right text-red-700">-{formatCurrency(m.totalExpense)}</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Sign off */}
        <div className="mt-16 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>This report was automatically generated from the JasiriCup secure ledger.</p>
          <p>For questions or detailed auditing, please contact our financial team.</p>
        </div>
      </div>
    </>
  );
}