// src/components/admin/FinancialReportTemplate.tsx
import Image from 'next/image';

interface ITransaction {
  _id: string; type: 'income' | 'expense'; category: string; amount: number;
  date: string; description: string; donorName?: string; paymentMethod: string; referenceNumber?: string;
}

interface MonthlyMetric { _id: { year: number; month: number }; totalIncome: number; totalExpense: number; }

interface ReportConfig {
  title: string; message: string; periodLabel: string; preparedBy: string;
  preparedBySignature?: string;
  authorizedSignatorySignature?: string;
  reportId?: string; serialNumber?: string; 
}

interface FinancialReportTemplateProps {
  config: ReportConfig;
  metrics: MonthlyMetric[];
  transactions: ITransaction[];
  totals: { income: number; expense: number; net: number; };
  formatCurrency: (amount: number) => string;
  getFullMonthName: (monthNumber: number) => string;
}

export const FinancialReportTemplate = ({
  config, metrics, transactions, totals, formatCurrency,
}: FinancialReportTemplateProps) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* YOU CAN CHANGE THE GOOGLE FONT URL HERE */
        @import url('https://fonts.googleapis.com/css2?family=Ms Madi:wght@700&display=swap');
        @media print {
          nav, aside, header, footer, button, .print\\:hidden { display: none !important; }
          :root, html, body, html.dark, body.dark {
            background-color: #ffffff !important; color: #0f172a !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
            margin: 0 !important; padding: 0 !important;
          }
          @page { size: A4 portrait; margin: 0 !important; }
          .print-report-container { display: block !important; width: 100%; background-color: #ffffff !important; padding: 15mm 15mm 20mm 15mm !important; box-sizing: border-box; }
          table { page-break-inside: auto; width: 100%; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          thead { display: table-header-group; }
          .signature-block { break-inside: avoid; page-break-inside: avoid; }
        }
        /* CHANGE THE FONT-FAMILY NAME HERE TO MATCH YOUR GOOGLE FONT */
        .font-signature { font-family: 'Ms Madi', cursive; }
      `}} />

      <div className="hidden print:block bg-white text-slate-900 min-h-screen print-report-container">
        <div className="max-w-[210mm] mx-auto bg-white font-sans text-slate-900">
          
          {/* Header Section */}
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-8 mt-2">
            <div className="flex flex-col gap-2">
              <div className="relative w-40 h-14 flex items-center justify-start mb-2">
                <Image src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png" alt="JaSiriCup Logo" width={160} height={56} className="w-auto h-full object-contain" priority />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{config.title}</h1>
            </div>
            
            <div className="text-right flex flex-col justify-end">
              <p className="font-bold text-[9px] text-slate-500 uppercase tracking-widest mb-1">Confidential Internal Document</p>
              <div className="bg-slate-50 text-slate-900 px-3 py-1.5 inline-block text-right">
                <p className="font-bold text-[8px] uppercase tracking-wider text-slate-500">Reporting Period</p>
                <p className="text-xs font-bold">{config.periodLabel}</p>
              </div>
            </div>
          </div>

          {/* Meta Data */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-8">
              <h2 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-200 pb-1">Executive Summary</h2>
              <p className="text-slate-800 leading-relaxed text-[11px] text-justify whitespace-pre-wrap pr-4">{config.message}</p>
            </div>
            <div className="col-span-4 bg-white p-3 border-l-2 border-slate-800 flex flex-col justify-center space-y-3">
              <div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                <p className="text-[10px] font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
              </div>
              {config.reportId && (
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Report Ref ID</p>
                  <p className="text-[10px] font-mono font-bold text-slate-900">{config.reportId}</p>
                </div>
              )}
              {config.serialNumber && (
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Report Serial No.</p>
                  <p className="text-[10px] font-mono font-black text-slate-900">{config.serialNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ledger Table */}
          <div className="mb-12">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-400">
                  <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-slate-700 w-24 border-r border-slate-300">Date</th>
                  <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-slate-700 border-r border-slate-300">Description</th>
                  <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-slate-700 text-right w-28 border-r border-slate-300">Inflow</th>
                  <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-slate-700 text-right w-28">Outflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx, index) => (
                  <tr key={tx._id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-2 px-2 font-medium text-[10px] text-slate-700 border-r border-slate-200">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-[10px] border-r border-slate-200"><span className="font-bold text-slate-900 block">{tx.category}</span>{tx.description}</td>
                    <td className="py-2 px-2 text-right text-emerald-700 text-[10px] font-bold border-r border-slate-200">{tx.type === 'income' ? formatCurrency(tx.amount) : ''}</td>
                    <td className="py-2 px-2 text-right text-slate-700 text-[10px] font-medium">{tx.type === 'expense' ? formatCurrency(tx.amount) : ''}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-[1px] border-slate-800">
                <tr className="bg-white border-t border-slate-400">
                  <td colSpan={2} className="py-3 px-2 text-right font-black text-[11px] uppercase tracking-widest text-slate-900 border-r border-slate-300">Net Retained Balance</td>
                  <td colSpan={2} className="py-3 px-2 text-right font-black text-slate-900 text-sm">{formatCurrency(totals.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* SIGNATURES (Strictly Typed ONLY) */}
          <div className="signature-block mt-16 grid grid-cols-2 gap-16 break-inside-avoid">
            <div>
              <div className="h-16 w-full flex items-end justify-center mb-1 relative overflow-hidden">
                {config.preparedBySignature && (
                  <span className="font-signature text-4xl text-slate-800 mb-1">{config.preparedBySignature}</span>
                )}
              </div>
              <div className="border-b border-slate-400 mb-1.5 w-full"></div>
              <p className="font-bold text-[10px] text-slate-900 uppercase tracking-widest text-center">Prepared By</p>
              <p className="text-[9px] text-slate-500 mt-0.5 text-center">{config.preparedBy}</p>
            </div>
            
            <div>
              <div className="h-16 w-full flex items-end justify-center mb-1 relative overflow-hidden">
                {config.authorizedSignatorySignature && (
                  <span className="font-signature text-4xl text-slate-800 mb-1">{config.authorizedSignatorySignature}</span>
                )}
              </div>
              <div className="border-b border-slate-400 mb-1.5 w-full"></div>
              <p className="font-bold text-[10px] text-slate-900 uppercase tracking-widest text-center">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="signature-block mt-12 pt-4 border-t border-slate-300 flex items-center justify-between text-[8px] text-slate-500 font-bold uppercase tracking-widest">
            <p>JaSiriCup Accounting System</p>
            <p>S/N: {config.serialNumber || 'N/A'}</p> 
          </div>
        </div>
      </div>
    </>
  );
};