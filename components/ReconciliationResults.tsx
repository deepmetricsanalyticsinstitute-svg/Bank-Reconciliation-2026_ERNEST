import React, { useState, useMemo } from 'react';
import type { ReconciliationResult, Transaction, MatchedPair } from '../types';
import { Dashboard } from './Dashboard';
import { generateCsv, generatePdf } from '../utils/downloadUtils';
import { DownloadIcon, SearchIcon } from './icons';

interface ReconciliationResultsProps {
  result: ReconciliationResult;
  onReset: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);
};

const DetailedReport: React.FC<{ result: ReconciliationResult }> = ({ result }) => {
    const { summary, matchedTransactions, unmatchedBankTransactions, unmatchedLedgerEntries } = result;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMatched = useMemo(() => {
        if (!searchTerm) return matchedTransactions;
        return matchedTransactions.filter(pair => 
            (pair.bankTransaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pair.ledgerTransaction.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (pair.bankTransaction.date.includes(searchTerm)) ||
            (pair.ledgerTransaction.date.includes(searchTerm)) ||
            (String(pair.bankTransaction.amount).includes(searchTerm))
        );
    }, [searchTerm, matchedTransactions]);

    const filteredUnmatchedBank = useMemo(() => {
        if (!searchTerm) return unmatchedBankTransactions;
        return unmatchedBankTransactions.filter(tx => 
            (tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.date.includes(searchTerm)) ||
            (String(tx.amount).includes(searchTerm))
        );
    }, [searchTerm, unmatchedBankTransactions]);

    const filteredUnmatchedLedger = useMemo(() => {
        if (!searchTerm) return unmatchedLedgerEntries;
        return unmatchedLedgerEntries.filter(tx =>
            (tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (tx.date.includes(searchTerm)) ||
            (String(tx.amount).includes(searchTerm))
        );
    }, [searchTerm, unmatchedLedgerEntries]);

    return (
        <div className="animate-fade-in">
            <div className="relative mb-6">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon />
                </div>
                <input
                    type="text"
                    placeholder="Filter transactions by description, date, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
            </div>

            <div className="space-y-6">
            <details className="bg-slate-900/50 rounded-lg p-4 border border-slate-700" open>
            <summary className="font-semibold text-xl cursor-pointer text-green-400">Matched Transactions ({filteredMatched.length})</summary>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                <thead className="text-slate-400 uppercase">
                    <tr>
                    <th className="p-2">Bank Date</th>
                    <th className="p-2">Bank Description</th>
                    <th className="p-2">Ledger Date</th>
                    <th className="p-2">Ledger Description</th>
                    <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMatched.map((pair: MatchedPair, index: number) => (
                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                        <td className="p-2 text-sky-400">{pair.bankTransaction.date}</td>
                        <td className="p-2 text-sky-400">{pair.bankTransaction.description}</td>
                        <td className="p-2 text-sky-400">{pair.ledgerTransaction.date}</td>
                        <td className="p-2 text-sky-400">{pair.ledgerTransaction.description}</td>
                        <td className="p-2 text-right font-mono text-green-300">{formatCurrency(pair.bankTransaction.amount)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </details>
            
            <details className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <summary className="font-semibold text-xl cursor-pointer text-orange-400">Unmatched Bank Transactions ({filteredUnmatchedBank.length})</summary>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                <thead className="text-slate-400 uppercase">
                    <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUnmatchedBank.map((tx: Transaction, index: number) => (
                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                        <td className="p-2 text-sky-400">{tx.date}</td>
                        <td className="p-2 text-sky-400">{tx.description}</td>
                        <td className="p-2 text-right font-mono text-orange-300">{formatCurrency(tx.amount)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </details>

            <details className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <summary className="font-semibold text-xl cursor-pointer text-yellow-400">Unmatched Ledger Entries ({filteredUnmatchedLedger.length})</summary>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm">
                <thead className="text-slate-400 uppercase">
                    <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUnmatchedLedger.map((tx: Transaction, index: number) => (
                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                        <td className="p-2 text-sky-400">{tx.date}</td>
                        <td className="p-2 text-sky-400">{tx.description}</td>
                        <td className="p-2 text-right font-mono text-yellow-300">{formatCurrency(tx.amount)}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </details>
        </div>
      </div>
    );
};


export const ReconciliationResults: React.FC<ReconciliationResultsProps> = ({ result, onReset }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const getTabClass = (tabName: string) => {
    return activeTab === tabName
      ? 'border-indigo-500 text-indigo-400'
      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500';
  };

  const handleDownloadCsv = () => {
    generateCsv(result);
  };
  
  const handleDownloadPdf = () => {
    generatePdf(result);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-100">Reconciliation Report</h2>
        <div className="mt-4 md:mt-0 border-b border-slate-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${getTabClass('dashboard')}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${getTabClass('details')}`}
            >
              Detailed Report
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <Dashboard result={result} />
      ) : (
        <DetailedReport result={result} />
      )}

      <div className="mt-8 text-center flex flex-wrap justify-center gap-4">
        <button
            onClick={onReset}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            Reconcile New Files
        </button>
         <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-lg hover:bg-sky-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            <DownloadIcon />
            Download CSV
        </button>
         <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            <DownloadIcon />
            Download PDF
        </button>
      </div>
    </div>
  );
};