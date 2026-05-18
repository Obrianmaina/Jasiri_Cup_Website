// src/app/admin/finances/FinancesClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Modal, SuccessModal } from '@/components/ui/Modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FinancialReportTemplate } from '@/components/admin/FinancialReportTemplate';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' });

interface ITransaction {
  _id: string; type: 'income' | 'expense'; category: string; amount: number;
  currency: string; date: string; description: string; donorName?: string;
  donorEmail?: string; receiptUrl?: string; status: 'completed' | 'voided';
  paymentMethod: string; referenceNumber?: string;
}

interface MonthlyMetric { _id: { year: number; month: number }; totalIncome: number; totalExpense: number; }

interface IReportLog {
  _id: string; reportId: string; title: string; periodLabel: string;
  preparedBy: string; generatedByEmail: string; totalIncome: number;
  totalExpense: number; netBalance: number; createdAt: string;
  preparedBySignature?: string; 
  authorizedSignatorySignature?: string;
}

interface ReportConfig {
  isOpen: boolean; title: string; message: string; periodFilter: string; periodLabel: string; preparedBy: string;
  preparedBySignature: string;
  authorizedSignatorySignature: string;
  reportId?: string; serialNumber?: string;
}

interface TransactionFormData {
  type: 'income' | 'expense'; category: string; amount: string | number; date: string; description: string; paymentMethod: string; donorName?: string; donorEmail?: string; referenceNumber?: string; receiptUrl?: string;
}

export default function FinancesClient({ canGenerateReports, userEmail }: { canGenerateReports: boolean, userEmail: string }) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'documents'>('ledger');
  
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [reportLogs, setReportLogs] = useState<IReportLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailModal, setEmailModal] = useState({ isOpen: false, reportId: '', recipient: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    isOpen: false, title: 'Financial Transparency Report', message: 'We are deeply grateful for your continuous support. Below is the summary of our financial activities, ensuring complete transparency in how every contribution empowers our mission.',
    periodFilter: 'all', periodLabel: 'Lifetime / All-Time Record', preparedBy: 'Admin Ledger Central',
    preparedBySignature: '',
    authorizedSignatorySignature: ''
  });

  const initialFormState: TransactionFormData = { type: 'income', category: 'Donation', amount: '', date: new Date().toISOString().split('T')[0], description: '', paymentMethod: 'M-Pesa', donorName: '', donorEmail: '', referenceNumber: '', receiptUrl: '' };
  const [formData, setFormData] = useState<TransactionFormData>(initialFormState);

  const fetchFinances = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/finances');
      const { data } = await res.json();
      setTransactions(data.transactions);
      setMetrics(data.metrics);
    } catch { toast.error('Failed to load financial data'); } finally { setLoading(false); }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/report-logs');
      const data = await res.json();
      if(data.success) setReportLogs(data.data);
    } catch { toast.error('Failed to load report documents'); }
  }, []);

  useEffect(() => { fetchFinances(); fetchReports(); }, [fetchFinances, fetchReports]);

  const openReportConfig = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    setReportConfig(prev => ({
      ...prev, isOpen: true, reportId: `Jasiricup_${dateStr}_${randomCode}`, serialNumber: randomCode
    }));
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const toastId = toast.loading('Logging transaction...');
    try {
      const payload = { ...formData, amount: Number(formData.amount), date: new Date(formData.date).toISOString() };
      const res = await fetch('/api/admin/finances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      toast.dismiss(toastId);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      setSuccessModal({ isOpen: true, message: 'Transaction logged successfully!' });
      fetchFinances();
    } catch { toast.error('Failed to log transaction', { id: toastId }); } finally { setProcessing(false); }
  };

  const executeGenerate = async () => {
    setProcessing(true);
    const tid = toast.loading('Registering report document...');
    
    try {
      const res = await fetch('/api/admin/report-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportConfig.reportId, 
          title: reportConfig.title, 
          periodLabel: reportConfig.periodLabel,
          preparedBy: reportConfig.preparedBy, 
          generatedByEmail: userEmail, 
          totalIncome: reportIncome, 
          totalExpense: reportExpense, 
          netBalance: reportNet,
          preparedBySignature: reportConfig.preparedBySignature,
          authorizedSignatorySignature: reportConfig.authorizedSignatorySignature
        })
      });
      
      if (!res.ok) throw new Error();
      
      toast.success('Report registered! You can now download or email it here.', { id: tid });
      setReportConfig(prev => ({ ...prev, isOpen: false })); 
      setActiveTab('documents'); 
      fetchReports(); 
    } catch (error) { 
      toast.error('Failed to create report entry.', { id: tid });
    } finally {
      setProcessing(false);
    }
  };

  const waitForRender = async (element: HTMLElement) => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; 
      });
    }));
  };

  const capturePDF = async (): Promise<Blob> => {
    const element = document.getElementById('financial-report-capture-zone');
    if (!element) throw new Error("Template container missing from DOM.");

    await waitForRender(element);

    try {
      const dataUrl = await toJpeg(element, { 
        quality: 0.90, 
        backgroundColor: '#ffffff',
        pixelRatio: 1.5,
        filter: (node) => {
          const tag = node.tagName;
          return tag !== 'SCRIPT' && tag !== 'NOSCRIPT'; 
        }
      });
      
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210; 
      const pageHeight = (element.offsetHeight * pageWidth) / element.offsetWidth; 
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
      return pdf.output('blob'); 
    } catch (err: unknown) {
      console.error("DOM Capture Error:", err);
      const errorMessage = err instanceof Error ? err.message : "Canvas generation failed.";
      throw new Error(errorMessage);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const tid = toast.loading('Generating PDF attachment and dispatching email...');
    
    try {
      const pdfBlob = await capturePDF();
      const formData = new FormData();
      formData.append("file", pdfBlob, `${emailModal.reportId}.pdf`);
      formData.append("recipient", emailModal.recipient);
      formData.append("message", emailModal.message);
      formData.append("reportId", emailModal.reportId);

      const res = await fetch('/api/admin/finances/send-report', {
        method: 'POST',
        body: formData 
      });

      if(!res.ok) throw new Error('API route rejected transmission.');
      
      toast.success('Dispatch complete!', { id: tid });
      setEmailModal({ isOpen: false, reportId: '', recipient: '', message: '' });
      setSuccessModal({ 
        isOpen: true, 
        message: `The financial report has been successfully attached and dispatched to ${emailModal.recipient}.` 
      });

    } catch (error: unknown) {
      console.error("Pipeline Error:", error);
      toast.error(`Dispatch failed: Check console.`, { id: tid });
    } finally { 
      setProcessing(false); 
    }
  };

  const handleDownloadHistorical = async (log: IReportLog) => {
    const tid = toast.loading('Compiling PDF format...');
    
    setReportConfig(prev => ({
      ...prev, 
      title: log.title, 
      periodLabel: log.periodLabel, 
      reportId: log.reportId, 
      preparedBy: log.preparedBy || prev.preparedBy,
      // 🚨 SMART FALLBACK: If old doc has no signature, use the preparedBy name
      preparedBySignature: log.preparedBySignature || log.preparedBy || 'Admin',
      authorizedSignatorySignature: log.authorizedSignatorySignature || 'Authorized Signatory'
    }));

    setTimeout(async () => {
      try {
        const element = document.getElementById('financial-report-capture-zone');
        if (!element) throw new Error("Template container missing.");

        await waitForRender(element);

        const dataUrl = await toJpeg(element, { 
          quality: 0.90, 
          backgroundColor: '#ffffff', 
          pixelRatio: 1.5, 
          filter: (node) => {
            const tag = node.tagName;
            return tag !== 'SCRIPT' && tag !== 'NOSCRIPT';
          }
        });
        
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = 210;
        const pageHeight = (element.offsetHeight * pageWidth) / element.offsetWidth;
        
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
        pdf.save(`${log.reportId}.pdf`); 

        toast.success('Download complete!', { id: tid });
      } catch (error: unknown) {
        console.error("Download Error:", error);
        toast.error('PDF render pipeline interrupted.', { id: tid });
      }
    }, 150);
  };

  const formatCurrency = (amt: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amt);
  const getMonthName = (monthNumber: number) => { const date = new Date(); date.setMonth(monthNumber - 1); return date.toLocaleString('default', { month: 'short' }); };
  const getFullMonthName = (monthNumber: number) => { const d = new Date(); d.setMonth(monthNumber - 1); return d.toLocaleString('default', { month: 'long' }); };

  const handleFilterChange = (val: string) => {
    let newLabel = 'Lifetime / All-Time Record';
    if (val !== 'all') { const [year, month] = val.split('-'); newLabel = `${getFullMonthName(parseInt(month))} ${year}`; }
    setReportConfig({ ...reportConfig, periodFilter: val, periodLabel: newLabel });
  };

  const totalLifetimeIncome = metrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const totalLifetimeExpense = metrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const netBalance = totalLifetimeIncome - totalLifetimeExpense;

  const filteredMetrics = reportConfig.periodFilter === 'all' ? metrics : metrics.filter(m => `${m._id.year}-${m._id.month}` === reportConfig.periodFilter);
  const filteredTransactions = reportConfig.periodFilter === 'all' ? transactions : transactions.filter(tx => { const d = new Date(tx.date); return `${d.getFullYear()}-${d.getMonth() + 1}` === reportConfig.periodFilter; });

  const reportIncome = filteredMetrics.reduce((sum, m) => sum + m.totalIncome, 0);
  const reportExpense = filteredMetrics.reduce((sum, m) => sum + m.totalExpense, 0);
  const reportNet = reportIncome - reportExpense;

  const chartData = [...metrics].reverse().map(m => ({ name: `${getMonthName(m._id.month)} ${m._id.year}`, Income: m.totalIncome, Expense: m.totalExpense }));

  return (
    <>
      <div className="pt-8 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 print:hidden">
        
        {/* Header and Tabs */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            {/* 👇 ADDED: Back to Dashboard Link 👇 */}
            <div className="mb-3">
              <Link 
                href="/admin/dashboard" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Dashboard
              </Link>
            </div>
            {/* 👆 END ADDED LINK 👆 */}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Finances & Transparency</h1>
            
            <div className="flex gap-4 mt-4">
              <button onClick={() => setActiveTab('ledger')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                Transactions Ledger
              </button>
              <button onClick={() => setActiveTab('documents')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'documents' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                Official Documents
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {canGenerateReports ? (
              <button onClick={openReportConfig} className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-center transition-colors">
                Generate Report
              </button>
            ) : (
              <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg font-medium border border-red-100 dark:border-red-900/30">
                Unauthorized to generate reports
              </span>
            )}
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 dark:bg-emerald-500 transition-colors shadow-sm text-center">
              + Log Transaction
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
        ) : (
          <>
            {/* LEDGER TAB */}
            {activeTab === 'ledger' && (
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

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-5 min-w-0 w-full">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-6">Cash Flow Trends</h3>
                  <div className="h-80 w-full min-w-0 relative">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `Ksh ${value >= 1000 ? (value/1000)+'k' : value}`} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                          <Line type="monotone" dataKey="Income" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
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
                      <h3 className="font-bold text-gray-900 dark:text-white">Monthly Summary</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                      {metrics.map((m) => (
                        <div key={`${m._id.year}-${m._id.month}`} className="p-4 flex justify-between items-center">
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
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{tx.paymentMethod}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 dark:text-white">Generated PDF Reports Archive</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-x-auto w-full">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 uppercase">
                      <tr><th className="p-4">Report ID</th><th className="p-4">Title</th><th className="p-4">Generated By</th><th className="p-4">Date</th><th className="p-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-800">
                      {reportLogs.map(log => (
                        <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-gray-900 dark:text-white">{log.reportId}</td>
                          <td className="p-4 text-gray-900 dark:text-white">{log.title}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-400">{log.generatedByEmail || log.preparedBy || 'Admin'}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleDownloadHistorical(log)} className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                              Download
                            </button>
                            <button onClick={() => {
                              setReportConfig(prev => ({
                                ...prev, 
                                title: log.title, 
                                periodLabel: log.periodLabel, 
                                reportId: log.reportId, 
                                preparedBy: log.preparedBy,
                                // 🚨 SMART FALLBACK for emails too
                                preparedBySignature: log.preparedBySignature || log.preparedBy || 'Admin',
                                authorizedSignatorySignature: log.authorizedSignatorySignature || 'Authorized Signatory'
                              }));
                              setEmailModal({ isOpen: true, reportId: log.reportId, recipient: '', message: '' });
                            }} className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                              Email
                            </button>
                          </td>
                        </tr>
                      ))}
                      {reportLogs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">No reports generated yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* LOG TRANSACTION MODAL */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log New Transaction" size="large">
          <form onSubmit={handleSaveTransaction} className="space-y-5">
            {/* Form fields remain exactly the same */}
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
                  {(formData.type === 'income' ? ['Donation', 'Grant', 'Merchandise', 'Other'] : ['Logistics', 'Marketing', 'Operations', 'Tax', 'Supplies', 'Other']).map(cat => (
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
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" disabled={processing} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors">Save Transaction</button>
            </div>
          </form>
        </Modal>

        {/* REPORT GENERATOR MODAL */}
        <Modal isOpen={reportConfig.isOpen} onClose={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} title="Configure Formal Report" size="large">
          <div className="space-y-5">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 p-3 rounded-lg flex items-center justify-between">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Generated Reference ID</p>
              <p className="text-xs font-mono font-bold text-purple-900 dark:text-purple-300 bg-white dark:bg-purple-900/50 px-2 py-1 rounded">{reportConfig.reportId}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Document Title</label><input type="text" value={reportConfig.title} onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm dark:bg-gray-900 dark:border-gray-700" /></div>
              <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Prepared By (Name/Role)</label><input type="text" value={reportConfig.preparedBy} onChange={(e) => setReportConfig({...reportConfig, preparedBy: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm dark:bg-gray-900 dark:border-gray-700" /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Data Filter (Period)</label>
                <select value={reportConfig.periodFilter} onChange={(e) => handleFilterChange(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="all">All-Time Lifetime Record</option>
                  {metrics.map(m => <option key={`${m._id.year}-${m._id.month}`} value={`${m._id.year}-${m._id.month}`}>{getFullMonthName(m._id.month)} {m._id.year}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Printed Timeline Label</label>
                <input type="text" value={reportConfig.periodLabel} onChange={(e) => setReportConfig({...reportConfig, periodLabel: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Executive Summary Message</label>
              <textarea rows={4} value={reportConfig.message} onChange={(e) => setReportConfig({...reportConfig, message: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prepared By Signature</label>
              <input type="text" value={reportConfig.preparedBySignature} onChange={(e) => setReportConfig({...reportConfig, preparedBySignature: e.target.value})} placeholder="Type name to sign..." className={`w-full border rounded-xl px-3 py-2 text-xl italic font-semibold bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 ${montserrat.className}`} />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authorized Signatory</label>
              <input type="text" value={reportConfig.authorizedSignatorySignature} onChange={(e) => setReportConfig({...reportConfig, authorizedSignatorySignature: e.target.value})} placeholder="Type name to sign..." className={`w-full border rounded-xl px-3 py-2 text-xl italic font-semibold bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 ${montserrat.className}`} />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} className="px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-200">Cancel</button>
              <button onClick={executeGenerate} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-40">
                {processing ? 'Processing...' : 'Register Official Document'}
              </button>
            </div>
          </div>
        </Modal>

        {/* EMAIL DISPATCH MODAL */}
        <Modal isOpen={emailModal.isOpen} onClose={() => setEmailModal({...emailModal, isOpen: false})} title="Dispatch Report via Email" size="medium">
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/50 mb-4">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400">Attaching Report: {emailModal.reportId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Recipient Email</label>
              <input required type="email" value={emailModal.recipient} onChange={(e) => setEmailModal({...emailModal, recipient: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm dark:bg-gray-900 dark:border-gray-700" placeholder="donor@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Brief Message</label>
              <textarea required rows={4} value={emailModal.message} onChange={(e) => setEmailModal({...emailModal, message: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm resize-none dark:bg-gray-900 dark:border-gray-700" placeholder="Please find attached the financial report..." />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
              <button type="button" onClick={() => setEmailModal({...emailModal, isOpen: false})} className="px-5 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-xl">Cancel</button>
              <button type="submit" disabled={processing} className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50">
                {processing ? 'Generating & Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        </Modal>

        <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, message: '' })} title="Success" message={successModal.message} />
      </div>

      {/* OFF-SCREEN DOM CAPTURE AREA */}
      <div style={{ 
        position: 'fixed',
        top: '-10000px', 
        left: '-10000px', 
        width: '1200px',
        zIndex: -1 
      }}>
        <div id="financial-report-capture-zone" style={{ width: '800px', backgroundColor: '#ffffff', padding: '20px' }}>
          <FinancialReportTemplate 
            config={reportConfig}
            metrics={filteredMetrics}
            transactions={filteredTransactions}
            totals={{ income: reportIncome, expense: reportExpense, net: reportNet }}
            formatCurrency={formatCurrency}
            getFullMonthName={getFullMonthName}
          />
        </div>
      </div>
    </>
  );
}