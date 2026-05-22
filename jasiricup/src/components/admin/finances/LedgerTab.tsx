import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ITransaction {
  _id: string; type: 'income' | 'expense'; category: string; amount: number; 
  date: string; description: string; paymentMethod: string; status: 'completed' | 'voided';
}

interface MonthlyMetric { _id: { year: number; month: number }; totalIncome: number; totalExpense: number; }

interface LedgerTabProps {
  totalLifetimeIncome: number;
  totalLifetimeExpense: number;
  netBalance: number;
  chartData: { name: string; Income: number; Expense: number; }[];
  metrics: MonthlyMetric[];
  transactions: ITransaction[];
  formatCurrency: (amt: number) => string;
  getMonthName: (monthNumber: number) => string;
}

export function LedgerTab({
  totalLifetimeIncome, totalLifetimeExpense, netBalance, chartData,
  metrics, transactions, formatCurrency, getMonthName
}: LedgerTabProps) {
  return (
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

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-5 min-w-0 w-full mt-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
  );
}