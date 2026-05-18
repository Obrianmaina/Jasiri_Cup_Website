// src/components/admin/FinancialReportTemplate.tsx
import React from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' });

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
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          nav, aside, header, footer, button, .print\\:hidden { display: none !important; }
          :root, html, body, html.dark, body.dark {
            background-color: #ffffff !important; color: #0f172a !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
            margin: 0 !important; padding: 0 !important;
          }
          @page { size: A4 portrait; margin: 0 !important; }
          .print-report-container { display: block !important; width: 100%; background-color: #ffffff !important; padding: 15mm 15mm 20mm 15mm !important; box-sizing: border-box; }
          table { page-break-inside: auto; width: 100%; border-collapse: collapse; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          thead { display: table-header-group; }
          .signature-block { break-inside: avoid; page-break-inside: avoid; }
        }
      `}} />

            <div className="w-full h-auto print-report-container" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                <div className="max-w-[210mm] mx-auto font-sans" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>

                    {/* Header Section */}
                    <div className="flex justify-between items-end pb-4 mb-8 mt-2 border-b-2" style={{ borderColor: '#0f172a' }}>
                        <div className="flex flex-col gap-2">
                            <div className="relative h-14 flex items-center justify-start mb-2">

                                {/* INLINE SVG LOGO */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 75" className="w-auto h-14 object-contain" fill="none">
                                    <g>
                                        <path d="M21.28 64.08C20.32 64.08 19.4 63.9733 18.52 63.76C17.64 63.5733 16.8933 63.28 16.28 62.88L17.96 58.36C18.68 58.8667 19.56 59.12 20.6 59.12C21.3733 59.12 21.9867 58.8533 22.44 58.32C22.92 57.8133 23.16 57.04 23.16 56V34.48H29.4V55.96C29.4 58.44 28.6933 60.4133 27.28 61.88C25.8667 63.3467 23.8667 64.08 21.28 64.08ZM26.28 31.48C25.1333 31.48 24.2 31.1467 23.48 30.48C22.76 29.8133 22.4 28.9867 22.4 28C22.4 27.0133 22.76 26.1867 23.48 25.52C24.2 24.8533 25.1333 24.52 26.28 24.52C27.4267 24.52 28.36 24.84 29.08 25.48C29.8 26.0933 30.16 26.8933 30.16 27.88C30.16 28.92 29.8 29.7867 29.08 30.48C28.3867 31.1467 27.4533 31.48 26.28 31.48ZM48.3456 56V51.8L47.9456 50.88V43.36C47.9456 42.0267 47.5323 40.9867 46.7056 40.24C45.9056 39.4933 44.6656 39.12 42.9856 39.12C41.839 39.12 40.7056 39.3067 39.5856 39.68C38.4923 40.0267 37.559 40.5067 36.7856 41.12L34.5456 36.76C35.719 35.9333 37.1323 35.2933 38.7856 34.84C40.439 34.3867 42.119 34.16 43.8256 34.16C47.1056 34.16 49.6523 34.9333 51.4656 36.48C53.279 38.0267 54.1856 40.44 54.1856 43.72V56H48.3456ZM41.7856 56.32C40.1056 56.32 38.6656 56.04 37.4656 55.48C36.2656 54.8933 35.3456 54.1067 34.7056 53.12C34.0656 52.1333 33.7456 51.0267 33.7456 49.8C33.7456 48.52 34.0523 47.4 34.6656 46.44C35.3056 45.48 36.3056 44.7333 37.6656 44.2C39.0256 43.64 40.799 43.36 42.9856 43.36H48.7056V47H43.6656C42.199 47 41.1856 47.24 40.6256 47.72C40.0923 48.2 39.8256 48.8 39.8256 49.52C39.8256 50.32 40.1323 50.96 40.7456 51.44C41.3856 51.8933 42.2523 52.12 43.3456 52.12C44.3856 52.12 45.319 51.88 46.1456 51.4C46.9723 50.8933 47.5723 50.16 47.9456 49.2L48.9056 52.08C48.4523 53.4667 47.6256 54.52 46.4256 55.24C45.2256 55.96 43.679 56.32 41.7856 56.32ZM69.4731 56.48C67.2331 56.48 65.0865 56.1867 63.0331 55.6C60.9798 54.9867 59.3265 54.2 58.0731 53.24L60.2731 48.36C61.4731 49.2133 62.8865 49.92 64.5131 50.48C66.1665 51.0133 67.8331 51.28 69.5131 51.28C70.7931 51.28 71.8198 51.16 72.5931 50.92C73.3931 50.6533 73.9798 50.2933 74.3531 49.84C74.7265 49.3867 74.9131 48.8667 74.9131 48.28C74.9131 47.5333 74.6198 46.9467 74.0331 46.52C73.4465 46.0667 72.6731 45.7067 71.7131 45.44C70.7531 45.1467 69.6865 44.88 68.5131 44.64C67.3665 44.3733 66.2065 44.0533 65.0331 43.68C63.8865 43.3067 62.8331 42.8267 61.8731 42.24C60.9131 41.6533 60.1265 40.88 59.5131 39.92C58.9265 38.96 58.6331 37.7333 58.6331 36.24C58.6331 34.64 59.0598 33.1867 59.9131 31.88C60.7931 30.5467 62.0998 29.4933 63.8331 28.72C65.5931 27.92 67.7931 27.52 70.4331 27.52C72.1931 27.52 73.9265 27.7333 75.6331 28.16C77.3398 28.56 78.8465 29.1733 80.1531 30L78.1531 34.92C76.8465 34.1733 75.5398 33.6267 74.2331 33.28C72.9265 32.9067 71.6465 32.72 70.3931 32.72C69.1398 32.72 68.1131 32.8667 67.3131 33.16C66.5131 33.4533 65.9398 33.84 65.5931 34.32C65.2465 34.7733 65.0731 35.3067 65.0731 35.92C65.0731 36.64 65.3665 37.2267 65.9531 37.68C66.5398 38.1067 67.3131 38.4533 68.2731 38.72C69.2331 38.9867 70.2865 39.2533 71.4331 39.52C72.6065 39.7867 73.7665 40.0933 74.9131 40.44C76.0865 40.7867 77.1531 41.2533 78.1131 41.84C79.0731 42.4267 79.8465 43.2 80.4331 44.16C81.0465 45.12 81.3531 46.3333 81.3531 47.8C81.3531 49.3733 80.9131 50.8133 80.0331 52.12C79.1531 53.4267 77.8331 54.48 76.0731 55.28C74.3398 56.08 72.1398 56.48 69.4731 56.48ZM85.3409 56V34.48H91.5809V56H85.3409ZM88.4609 31.48C87.3143 31.48 86.3809 31.1467 85.6609 30.48C84.9409 29.8133 84.5809 28.9867 84.5809 28C84.5809 27.0133 84.9409 26.1867 85.6609 25.52C86.3809 24.8533 87.3143 24.52 88.4609 24.52C89.6076 24.52 90.5409 24.84 91.2609 25.48C91.9809 26.0933 92.3409 26.8933 92.3409 27.88C92.3409 28.92 91.9809 29.7867 91.2609 30.48C90.5676 31.1467 89.6343 31.48 88.4609 31.48ZM97.3722 56V34.48H103.332V40.56L102.492 38.8C103.132 37.28 104.159 36.1333 105.572 35.36C106.986 34.56 108.706 34.16 110.732 34.16V39.92C110.466 39.8933 110.226 39.88 110.012 39.88C109.799 39.8533 109.572 39.84 109.332 39.84C107.626 39.84 106.239 40.3333 105.172 41.32C104.132 42.28 103.612 43.7867 103.612 45.84V56H97.3722ZM114.482 56V34.48H120.722V56H114.482ZM117.602 31.48C116.455 31.48 115.522 31.1467 114.802 30.48C114.082 29.8133 113.722 28.9867 113.722 28C113.722 27.0133 114.082 26.1867 114.802 25.52C115.522 24.8533 116.455 24.52 117.602 24.52C118.748 24.52 119.682 24.84 120.402 25.48C121.122 26.0933 121.482 26.8933 121.482 27.88C121.482 28.92 121.122 29.7867 120.402 30.48C119.708 31.1467 118.775 31.48 117.602 31.48ZM136.913 56.32C134.593 56.32 132.526 55.8533 130.713 54.92C128.899 53.96 127.473 52.64 126.433 50.96C125.419 49.28 124.913 47.3733 124.913 45.24C124.913 43.08 125.419 41.1733 126.433 39.52C127.473 37.84 128.899 36.5333 130.713 35.6C132.526 34.64 134.593 34.16 136.913 34.16C139.179 34.16 141.153 34.64 142.833 35.6C144.513 36.5333 145.753 37.88 146.553 39.64L141.713 42.24C141.153 41.2267 140.446 40.48 139.593 40C138.766 39.52 137.859 39.28 136.873 39.28C135.806 39.28 134.846 39.52 133.993 40C133.139 40.48 132.459 41.16 131.953 42.04C131.473 42.92 131.233 43.9867 131.233 45.24C131.233 46.4933 131.473 47.56 131.953 48.44C132.459 49.32 133.139 50 133.993 50.48C134.846 50.96 135.806 51.2 136.873 51.2C137.859 51.2 138.766 50.9733 139.593 50.52C140.446 50.04 141.153 49.28 141.713 48.24L146.553 50.88C145.753 52.6133 144.513 53.96 142.833 54.92C141.153 55.8533 139.179 56.32 136.913 56.32Z" fill="#1AA75B" />
                                        <path d="M213.6 34.16C215.6 34.16 217.413 34.6267 219.04 35.56C220.693 36.4667 221.987 37.76 222.92 39.44C223.853 41.0933 224.32 43.0267 224.32 45.24C224.32 47.4533 223.853 49.4 222.92 51.08C221.987 52.7333 220.693 54.0267 219.04 54.96C217.413 55.8667 215.6 56.32 213.6 56.32C210.853 56.32 208.693 55.4533 207.12 53.72V63.76H200.88V34.48H206.84V36.96C208.387 35.0933 210.64 34.16 213.6 34.16ZM212.52 51.2C214.12 51.2 215.427 50.6667 216.44 49.6C217.48 48.5067 218 47.0533 218 45.24C218 43.4267 217.48 41.9867 216.44 40.92C215.427 39.8267 214.12 39.28 212.52 39.28C210.92 39.28 209.6 39.8267 208.56 40.92C207.547 41.9867 207.04 43.4267 207.04 45.24C207.04 47.0533 207.547 48.5067 208.56 49.6C209.6 50.6667 210.92 51.2 212.52 51.2Z" fill="#1AA75B" />
                                        <path d="M192.584 35.7641C195.14 35.0312 197.858 36.5159 198.069 39.1665C198.241 41.3321 198.12 43.5184 197.702 45.6654C196.977 49.3945 195.38 52.8991 193.041 55.8926C190.703 58.8861 187.689 61.2836 184.246 62.8891C180.803 64.4946 177.029 65.2624 173.232 65.1298C169.436 64.9972 165.724 63.968 162.402 62.1263C159.079 60.2846 156.24 57.6827 154.115 54.5333C151.991 51.3839 150.642 47.7765 150.179 44.006C149.913 41.8351 149.944 39.6456 150.267 37.4973C150.662 34.8678 153.477 33.5763 155.976 34.4857C158.474 35.3951 159.673 38.1865 159.631 40.8451C159.62 41.5073 159.655 42.1713 159.737 42.8325C160.014 45.0948 160.824 47.2593 162.098 49.1489C163.373 51.0385 165.076 52.5997 167.07 53.7047C169.064 54.8097 171.29 55.4272 173.568 55.5068C175.846 55.5863 178.111 55.1256 180.176 54.1624C182.242 53.1991 184.05 51.7606 185.454 49.9645C186.857 48.1683 187.815 46.0656 188.25 43.8282C188.377 43.1743 188.459 42.5143 188.494 41.853C188.638 39.1979 190.028 36.497 192.584 35.7641Z" fill="#8C66DC" />
                                    </g>
                                </svg>

                            </div>
                            <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: '#0f172a' }}>{config.title}</h1>
                        </div>

                        <div className="text-right flex flex-col justify-end">
                            <p className="font-bold text-[9px] uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Confidential Internal Document</p>
                            <div className="px-3 py-1.5 inline-block text-right" style={{ backgroundColor: '#f8fafc', color: '#0f172a' }}>
                                <p className="font-bold text-[8px] uppercase tracking-wider" style={{ color: '#64748b' }}>Reporting Period</p>
                                <p className="text-xs font-bold">{config.periodLabel}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-12 gap-6 mb-8">
                        <div className="col-span-8">
                            <h2 className="text-[9px] font-bold uppercase tracking-widest mb-2 border-b pb-1" style={{ color: '#64748b', borderColor: '#e2e8f0' }}>Executive Summary</h2>
                            <p className="leading-relaxed text-[11px] text-justify whitespace-pre-wrap pr-4" style={{ color: '#1e293b' }}>{config.message}</p>
                        </div>
                        <div className="col-span-4 p-3 border-l-2 flex flex-col justify-center space-y-3" style={{ backgroundColor: '#ffffff', borderColor: '#1e293b' }}>
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Date Issued</p>
                                <p className="text-[10px] font-bold" style={{ color: '#0f172a' }}>{new Date().toLocaleDateString()}</p>
                            </div>
                            {config.reportId && (
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Report Ref ID</p>
                                    <p className="text-[10px] font-mono font-bold" style={{ color: '#0f172a' }}>{config.reportId}</p>
                                </div>
                            )}
                            {config.serialNumber && (
                                <div>
                                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Report Serial No.</p>
                                    <p className="text-[10px] font-mono font-black" style={{ color: '#0f172a' }}>{config.serialNumber}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="mb-12">
                        <table className="w-full text-left border-collapse border" style={{ borderColor: '#cbd5e1' }}>
                            <thead>
                                <tr className="border-b-2" style={{ backgroundColor: '#f1f5f9', borderColor: '#94a3b8' }}>
                                    <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest w-24 border-r" style={{ color: '#334155', borderColor: '#cbd5e1' }}>Date</th>
                                    <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest border-r" style={{ color: '#334155', borderColor: '#cbd5e1' }}>Description</th>
                                    <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-right w-28 border-r" style={{ color: '#334155', borderColor: '#cbd5e1' }}>Inflow</th>
                                    <th className="py-2 px-2 font-bold text-[9px] uppercase tracking-widest text-right w-28" style={{ color: '#334155' }}>Outflow</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <tr key={tx._id} className="border-b" style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', borderColor: '#e2e8f0' }}>
                                        <td className="py-2 px-2 font-medium text-[10px] border-r" style={{ color: '#334155', borderColor: '#e2e8f0' }}>{new Date(tx.date).toLocaleDateString()}</td>
                                        <td className="py-2 px-2 text-[10px] border-r" style={{ borderColor: '#e2e8f0' }}><span className="font-bold block" style={{ color: '#0f172a' }}>{tx.category}</span>{tx.description}</td>
                                        <td className="py-2 px-2 text-right text-[10px] font-bold border-r" style={{ color: '#047857', borderColor: '#e2e8f0' }}>{tx.type === 'income' ? formatCurrency(tx.amount) : ''}</td>
                                        <td className="py-2 px-2 text-right text-[10px] font-medium" style={{ color: '#334155' }}>{tx.type === 'expense' ? formatCurrency(tx.amount) : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-[1px]" style={{ borderColor: '#1e293b' }}>
                                <tr className="border-t" style={{ backgroundColor: '#ffffff', borderColor: '#94a3b8' }}>
                                    <td colSpan={2} className="py-3 px-2 text-right font-black text-[11px] uppercase tracking-widest border-r" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>Net Retained Balance</td>
                                    <td colSpan={2} className="py-3 px-2 text-right font-black text-sm" style={{ color: '#0f172a' }}>{formatCurrency(totals.net)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* SIGNATURES - Montserrat Applied */}
                    <div className="signature-block mt-16 grid grid-cols-2 gap-16 break-inside-avoid">
                        <div>
                            <div className="h-16 w-full flex items-end justify-center mb-1 relative overflow-hidden">
                                {config.preparedBySignature && (
                                    <span
                                        className={`text-2xl italic font-bold mb-1 ${montserrat.className}`}
                                        style={{ color: '#1e293b' }}
                                    >
                                        {config.preparedBySignature}
                                    </span>
                                )}
                            </div>
                            <div className="border-b mb-1.5 w-full" style={{ borderColor: '#94a3b8' }}></div>
                            <p className="font-bold text-[10px] uppercase tracking-widest text-center" style={{ color: '#0f172a' }}>Prepared By</p>
                            <p className="text-[9px] mt-0.5 text-center" style={{ color: '#64748b' }}>{config.preparedBy}</p>
                        </div>

                        <div>
                            <div className="h-16 w-full flex items-end justify-center mb-1 relative overflow-hidden">
                                {config.authorizedSignatorySignature && (
                                    <span
                                        className={`text-2xl italic font-bold mb-1 ${montserrat.className}`}
                                        style={{ color: '#1e293b' }}
                                    >
                                        {config.authorizedSignatorySignature}
                                    </span>
                                )}
                            </div>
                            <div className="border-b mb-1.5 w-full" style={{ borderColor: '#94a3b8' }}></div>
                            <p className="font-bold text-[10px] uppercase tracking-widest text-center" style={{ color: '#0f172a' }}>Authorized Signatory</p>
                        </div>
                    </div>

                    {/* Footer Bar */}
                    <div className="signature-block mt-12 pt-4 border-t flex items-center justify-between text-[8px] font-bold uppercase tracking-widest" style={{ borderColor: '#cbd5e1', color: '#64748b' }}>
                        <p>JaSiriCup Accounting System</p>
                        <p>S/N: {config.serialNumber || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </>
    );
};