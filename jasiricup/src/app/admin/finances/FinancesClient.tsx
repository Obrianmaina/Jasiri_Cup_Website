// src/app/admin/finances/FinancesClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Modal, SuccessModal } from '@/components/ui/Modal';
import { FinancialReportTemplate } from '@/components/admin/FinancialReportTemplate';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import Link from 'next/link';

import { LedgerTab } from '@/components/admin/finances/LedgerTab';
import { DocumentsTab } from '@/components/admin/finances/DocumentsTab';

interface ITransaction {
  _id: string; type: 'income' | 'expense'; category: string; amount: number;
  currency: string; date: string; description: string; donorName?: string;
  donorEmail?: string; receiptUrl?: string; status: 'completed' | 'voided';
  paymentMethod: string; referenceNumber?: string;
  originalAmount?: number; originalCurrency?: string; exchangeRate?: number;
  voidReason?: string;
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
  preparedBySignature: string; authorizedSignatorySignature: string;
  reportId?: string; serialNumber?: string;
}

interface TransactionFormData {
  type: 'income' | 'expense'; category: string; amount: string | number; 
  originalCurrency: 'KES' | 'USD' | 'EUR' | 'GBP'; 
  date: string; description: string; paymentMethod: string; 
  donorName?: string; donorEmail?: string; referenceNumber?: string; receiptUrl?: string;
}

export default function FinancesClient({ canGenerateReports, userEmail }: { canGenerateReports: boolean, userEmail: string }) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'documents'>('ledger');
  
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [reportLogs, setReportLogs] = useState<IReportLog[]>([]);
  
  const [liveRates, setLiveRates] = useState<Record<string, number>>({ KES: 1, USD: 0.0075, EUR: 0.0069, GBP: 0.0059 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [emailModal, setEmailModal] = useState({ isOpen: false, reportId: '', recipient: '', message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    isOpen: false, 
    title: 'Financial Transparency Report', 
    message: 'We are deeply grateful for your continuous support. Below is the summary of our financial activities, ensuring complete transparency in how every contribution empowers our mission.',
    periodFilter: 'all', 
    periodLabel: 'Lifetime / All-Time Record', 
    preparedBy: userEmail, // Auto-fetches your logged in email
    preparedBySignature: 'finance', // Default to Head of Finance
    authorizedSignatorySignature: 'director' // Default to Executive Director
  });

  const initialFormState: TransactionFormData = { 
    type: 'income', category: 'Individual Donation', amount: '', originalCurrency: 'KES', 
    date: new Date().toISOString().split('T')[0], description: '', 
    paymentMethod: 'Bank Transfer', donorName: '', donorEmail: '', referenceNumber: '', receiptUrl: '' 
  };
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

  useEffect(() => { 
    fetchFinances(); 
    fetchReports(); 
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => { if (data.rates) setLiveRates(data.rates); })
      .catch(err => console.error("Failed to fetch live rates", err));
  }, [fetchFinances, fetchReports]);

  const kesPreview = formData.originalCurrency === 'KES'
    ? null
    : Number(formData.amount || 0) * (1 / (liveRates[formData.originalCurrency] || 1));

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
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server rejected');
      }
      toast.dismiss(toastId);
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      setIsCustomCategory(false);
      setSuccessModal({ isOpen: true, message: 'Transaction logged successfully!' });
      fetchFinances();
    } catch (error: unknown) { 
      toast.error(error instanceof Error ? error.message : 'Failed to log transaction', { id: toastId }); 
    } finally { setProcessing(false); }
  };

  const handleVoidTransaction = async (id: string) => {
    const reason = window.prompt("Please enter a reason for voiding this transaction:");
    if (!reason || !reason.trim()) return;

    const tid = toast.loading('Voiding transaction...');
    try {
      const res = await fetch(`/api/admin/finances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'void', voidReason: reason.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to void');
      
      toast.success('Transaction voided successfully.', { id: tid });
      fetchFinances();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error voiding transaction', { id: tid });
    }
  };

  const executeGenerate = async () => { 
    setProcessing(true);
    const tid = toast.loading('Registering report document...');
    try {
      const res = await fetch('/api/admin/report-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportConfig.reportId, title: reportConfig.title, periodLabel: reportConfig.periodLabel,
          preparedBy: reportConfig.preparedBy, generatedByEmail: userEmail, totalIncome: reportIncome, 
          totalExpense: reportExpense, netBalance: reportNet, preparedBySignature: reportConfig.preparedBySignature,
          authorizedSignatorySignature: reportConfig.authorizedSignatorySignature
        })
      });
      if (!res.ok) throw new Error();
      toast.success('Report registered! You can now download or email it here.', { id: tid });
      setReportConfig(prev => ({ ...prev, isOpen: false })); 
      setActiveTab('documents'); fetchReports(); 
    } catch (error) { toast.error('Failed to create report entry.', { id: tid }); } finally { setProcessing(false); }
  };

  const waitForRender = async (element: HTMLElement) => { 
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await document.fonts.ready;
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
    }));
  };

  const capturePDF = async (): Promise<Blob> => { 
    const element = document.getElementById('financial-report-capture-zone');
    if (!element) throw new Error("Template container missing from DOM.");
    await waitForRender(element);
    try {
      const dataUrl = await toJpeg(element, { quality: 0.90, backgroundColor: '#ffffff', pixelRatio: 1.5, filter: (node) => node.tagName !== 'SCRIPT' && node.tagName !== 'NOSCRIPT' });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210; const pageHeight = (element.offsetHeight * pageWidth) / element.offsetWidth; 
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight); return pdf.output('blob'); 
    } catch (err: unknown) { throw new Error(err instanceof Error ? err.message : "Canvas generation failed."); }
  };

  const handleSendEmail = async (e: React.FormEvent) => { 
    e.preventDefault(); setProcessing(true); const tid = toast.loading('Generating PDF attachment and dispatching email...');
    try {
      const pdfBlob = await capturePDF(); const formData = new FormData();
      formData.append("file", pdfBlob, `${emailModal.reportId}.pdf`); formData.append("recipient", emailModal.recipient);
      formData.append("message", emailModal.message); formData.append("reportId", emailModal.reportId);
      const res = await fetch('/api/admin/finances/send-report', { method: 'POST', body: formData });
      if(!res.ok) throw new Error('API route rejected transmission.');
      toast.success('Dispatch complete!', { id: tid }); setEmailModal({ isOpen: false, reportId: '', recipient: '', message: '' });
      setSuccessModal({ isOpen: true, message: `The financial report has been successfully attached and dispatched to ${emailModal.recipient}.` });
    } catch (error: unknown) { toast.error(`Dispatch failed: Check console.`, { id: tid }); } finally { setProcessing(false); }
  };

  const handleDownloadHistorical = async (log: IReportLog) => { 
    const tid = toast.loading('Compiling PDF format...');
    setReportConfig(prev => ({
      ...prev, title: log.title, periodLabel: log.periodLabel, reportId: log.reportId, preparedBy: log.preparedBy || prev.preparedBy,
      preparedBySignature: log.preparedBySignature || 'finance', authorizedSignatorySignature: log.authorizedSignatorySignature || 'director'
    }));
    setTimeout(async () => {
      try {
        const element = document.getElementById('financial-report-capture-zone');
        if (!element) throw new Error("Template container missing."); await waitForRender(element);
        const dataUrl = await toJpeg(element, { quality: 0.90, backgroundColor: '#ffffff', pixelRatio: 1.5, filter: (node) => node.tagName !== 'SCRIPT' && node.tagName !== 'NOSCRIPT' });
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = 210; const pageHeight = (element.offsetHeight * pageWidth) / element.offsetWidth;
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight); pdf.save(`${log.reportId}.pdf`); toast.success('Download complete!', { id: tid });
      } catch (error: unknown) { toast.error('PDF render pipeline interrupted.', { id: tid }); }
    }, 150);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (KES)', 'Original Currency', 'Original Amount', 'Exchange Rate', 'Payment Method', 'Reference Number', 'Status', 'Void Reason'];
    
    const rows = filteredTransactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.type,
      tx.category,
      `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes for CSV
      tx.amount,
      tx.originalCurrency || 'KES',
      tx.originalAmount || tx.amount,
      tx.exchangeRate || 1,
      tx.paymentMethod,
      tx.referenceNumber || '',
      tx.status,
      tx.voidReason ? `"${tx.voidReason.replace(/"/g, '""')}"` : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JasiriCup_Ledger_${reportConfig.periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEmailModal = (log: IReportLog) => {
    setReportConfig(prev => ({
      ...prev, title: log.title, periodLabel: log.periodLabel, reportId: log.reportId, 
      preparedBy: log.preparedBy, preparedBySignature: log.preparedBySignature || 'finance', authorizedSignatorySignature: log.authorizedSignatorySignature || 'director'
    }));
    setEmailModal({ isOpen: true, reportId: log.reportId, recipient: '', message: '' });
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
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <div className="mb-3">
              <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Finances & Transparency</h1>
            <div className="flex gap-4 mt-4">
              <button onClick={() => setActiveTab('ledger')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Transactions Ledger</button>
              <button onClick={() => setActiveTab('documents')} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'documents' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Official Documents</button>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
            {canGenerateReports ? (
              <>
                <button onClick={handleExportCSV} className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-center transition-colors">
                  Export CSV
                </button>
                <button onClick={openReportConfig} className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm text-center transition-colors">
                  Generate Report
                </button>
              </>
            ) : (
              <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg font-medium border border-red-100 dark:border-red-900/30">Unauthorized</span>
            )}
            <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 dark:bg-emerald-500 transition-colors shadow-sm text-center">+ Log Transaction</button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
        ) : (
          <>
            {activeTab === 'ledger' && (
              <LedgerTab 
                totalLifetimeIncome={totalLifetimeIncome}
                totalLifetimeExpense={totalLifetimeExpense}
                netBalance={netBalance}
                chartData={chartData}
                metrics={metrics}
                transactions={transactions}
                formatCurrency={formatCurrency}
                getMonthName={getMonthName}
                onVoidTransaction={handleVoidTransaction}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentsTab 
                reportLogs={reportLogs}
                handleDownloadHistorical={handleDownloadHistorical}
                onOpenEmailModal={handleOpenEmailModal}
              />
            )}
          </>
        )}

        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => {
            setIsAddModalOpen(false);
            setIsCustomCategory(false);
          }} 
          title="Log New Transaction" 
          size="large"
        >
          <form onSubmit={handleSaveTransaction} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => {
                    const newType = e.target.value as 'income' | 'expense';
                    setFormData({
                      ...formData, 
                      type: newType,
                      category: newType === 'income' ? 'Individual Donation' : 'Operations & Admin' 
                    });
                    setIsCustomCategory(false); 
                  }} 
                  className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="income">Income (Money In)</option>
                  <option value="expense">Expense (Money Out)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={isCustomCategory ? 'Custom...' : formData.category} 
                    onChange={(e) => {
                      if (e.target.value === 'Custom...') {
                        setIsCustomCategory(true);
                        setFormData({...formData, category: ''}); 
                      } else {
                        setIsCustomCategory(false);
                        setFormData({...formData, category: e.target.value});
                      }
                    }} 
                    className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {(formData.type === 'income' 
                      ? ['Individual Donation', 'Corporate Sponsorship', 'Foundation Grant', 'Merchandise Sales', 'Event Ticket Sales', 'Custom...'] 
                      : ['Logistics & Transport', 'Website & IT', 'Marketing & PR', 'Operations & Admin', 'Legal & Compliance', 'Field Supplies', 'Product Manufacturing', 'Team & Payroll', 'Custom...']
                    ).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {isCustomCategory && (
                  <input 
                    required 
                    type="text" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 text-sm bg-emerald-50/50 dark:bg-emerald-900/10 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 placeholder-emerald-600/50" 
                    placeholder="Type custom category name..." 
                    autoFocus
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <div className="flex gap-2">
                  <select 
                    value={formData.originalCurrency} 
                    onChange={(e) => setFormData({...formData, originalCurrency: e.target.value as 'KES' | 'USD' | 'EUR' | 'GBP'})} 
                    className="border border-gray-300 dark:border-gray-700 rounded-xl px-2 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-bold"
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input required type="number" min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
                </div>
                {kesPreview !== null && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-bold">
                    ≈ KES {kesPreview.toLocaleString(undefined, { maximumFractionDigits: 2 })} at today&apos;s rate
                  </p>
                )}
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

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ref Number (Optional)</label>
                <input type="text" value={formData.referenceNumber} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Bank trace ID" />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt URL (Optional)</label>
                <input type="url" value={formData.receiptUrl} onChange={(e) => setFormData({...formData, receiptUrl: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="https://..." />
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
              <button 
                type="button" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsCustomCategory(false);
                }} 
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button type="submit" disabled={processing || formData.amount === ''} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 transition-colors">Save Transaction</button>
            </div>
          </form>
        </Modal>

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
              <select value={reportConfig.preparedBySignature} onChange={(e) => setReportConfig({...reportConfig, preparedBySignature: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="finance">Head of Finance</option>
                <option value="director">Executive Director</option>
                <option value="treasurer">Board Treasurer</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authorized Signatory</label>
              <select value={reportConfig.authorizedSignatorySignature} onChange={(e) => setReportConfig({...reportConfig, authorizedSignatorySignature: e.target.value})} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="director">Executive Director</option>
                <option value="treasurer">Board Treasurer</option>
                <option value="finance">Head of Finance</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setReportConfig(prev => ({ ...prev, isOpen: false }))} className="px-5 py-2.5 text-sm font-semibold bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-200">Cancel</button>
              <button onClick={executeGenerate} disabled={processing} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-40">
                {processing ? 'Processing...' : 'Register Official Document'}
              </button>
            </div>
          </div>
        </Modal>

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

      <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', width: '1200px', zIndex: -1 }}>
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