import React from 'react';
import type { ReconciliationResult, Transaction } from '../types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);
};

const SummaryCard: React.FC<{ title: string; value: string | number; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md border-l-4" style={{ borderColor: colorClass }}>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
);

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-full text-slate-400">No data for chart.</div>;

  let cumulative = 0;
  const segments = data.map(item => {
    const percentage = item.value / total;
    const startAngle = (cumulative / total) * 360;
    cumulative += item.value;
    const endAngle = (cumulative / total) * 360;
    return { ...item, percentage, startAngle, endAngle };
  });

  const getCoords = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="-1.2 -1.2 2.4 2.4" className="transform -rotate-90">
        {segments.map((segment, index) => {
          if (segment.value === 0) return null;
          const [startX, startY] = getCoords(segment.startAngle / 360);
          const [endX, endY] = getCoords(segment.endAngle / 360);
          const largeArcFlag = segment.percentage > 0.5 ? 1 : 0;
          const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`;
          return (
            <path key={index} d={pathData} fill="none" stroke={segment.color} strokeWidth="0.4" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-100">{total}</span>
        <span className="text-sm text-slate-400">Total Items</span>
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    
    return (
        <div className="w-full h-64 flex justify-around items-end space-x-4 p-4">
            {data.map((item, index) => {
                const barHeight = (item.value / maxValue) * 100;
                return (
                    <div key={index} className="flex-1 flex flex-col items-center h-full">
                        <div 
                            className="w-full rounded-t-md transition-all duration-500"
                            style={{ height: `${barHeight}%`, backgroundColor: item.color }}
                        >
                        </div>
                        <div className="text-center mt-2">
                             <p className="text-xs text-slate-400 truncate">{item.label}</p>
                             <p className="font-bold text-sm text-slate-200">{formatCurrency(item.value)}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


export const Dashboard: React.FC<{ result: ReconciliationResult }> = ({ result }) => {
  const { summary, unmatchedBankTransactions, unmatchedLedgerEntries } = result;
  
  const donutData = [
    { label: 'Matched', value: summary.matchedCount, color: '#22c55e' },
    { label: 'Unmatched (Bank)', value: summary.unmatchedBankCount, color: '#f97316' },
    { label: 'Unmatched (Ledger)', value: summary.unmatchedLedgerCount, color: '#eab308' },
  ];

  const barData = [
    { label: 'Matched Total', value: summary.matchedTotal, color: '#22c55e' },
    { label: 'Unmatched Bank', value: summary.unmatchedBankTotal, color: '#f97316' },
    { label: 'Unmatched Ledger', value: summary.unmatchedLedgerTotal, color: '#eab308' },
  ];

  const topUnmatched = [...unmatchedBankTransactions, ...unmatchedLedgerEntries]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // FIX: Explicitly type UnmatchedRow as a React Functional Component (`React.FC`).
  // This ensures TypeScript correctly recognizes it and allows passing the `key` prop during list rendering.
  const UnmatchedRow: React.FC<{tx: Transaction, color: string}> = ({ tx, color }) => (
     <tr className="border-b border-slate-700 hover:bg-slate-800">
        <td className="p-2 text-sky-400">{tx.date}</td>
        <td className="p-2 text-sky-400">{tx.description}</td>
        <td className={`p-2 text-right font-mono`} style={{ color }}>{formatCurrency(tx.amount)}</td>
    </tr>
  );

  return (
    <div className="animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <SummaryCard title="Matched" value={summary.matchedCount} colorClass="#22c55e" />
            <SummaryCard title="Unmatched (Bank)" value={summary.unmatchedBankCount} colorClass="#f97316" />
            <SummaryCard title="Unmatched (Ledger)" value={summary.unmatchedLedgerCount} colorClass="#eab308" />
            <SummaryCard title="Matched Total" value={formatCurrency(summary.matchedTotal)} colorClass="#22c55e" />
            <SummaryCard title="Unmatched Bank Total" value={formatCurrency(summary.unmatchedBankTotal)} colorClass="#f97316" />
            <SummaryCard title="Unmatched Ledger Total" value={formatCurrency(summary.unmatchedLedgerTotal)} colorClass="#eab308" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-xl font-semibold text-center mb-4 text-slate-200">Transaction Count Breakdown</h3>
                <DonutChart data={donutData} />
            </div>
             <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-xl font-semibold text-center mb-4 text-slate-200">Total Amount Comparison</h3>
                <BarChart data={barData} />
            </div>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
             <h3 className="text-xl font-semibold text-slate-200 mb-4">Top 5 Largest Unmatched Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400 uppercase">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUnmatched.length > 0 ? (
                        topUnmatched.map((tx, index) => {
                           const isBank = unmatchedBankTransactions.includes(tx);
                           return <UnmatchedRow key={index} tx={tx} color={isBank ? '#f97316' : '#eab308'} />
                        })
                    ) : (
                        <tr><td colSpan={3} className="text-center p-4 text-slate-400">No unmatched transactions.</td></tr>
                    )}
                  </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};