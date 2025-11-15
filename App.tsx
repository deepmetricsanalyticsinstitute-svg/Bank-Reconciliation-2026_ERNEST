import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ReconciliationResults } from './components/ReconciliationResults';
import { Spinner } from './components/Spinner';
import { reconcileFiles } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import type { ReconciliationResult } from './types';
import { AppIcon } from './components/icons';
import { ModelToggle } from './components/ModelToggle';

type ModelType = 'flash' | 'pro';

const loadingMessages = [
  'Parsing bank statement...',
  'Extracting ledger entries...',
  'Comparing thousands of transactions...',
  'AI is matching line items...',
  'Identifying discrepancies...',
  'Generating final report...',
];

const App: React.FC = () => {
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [ledger, setLedger] = useState<File | null>(null);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelType>('pro');

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      intervalId = window.setInterval(() => {
        setLoadingMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      setProgress(((loadingMessageIndex + 1) / loadingMessages.length) * 100);
    }
  }, [loadingMessageIndex, isLoading]);


  const handleReconcile = useCallback(async () => {
    if (!bankStatement || !ledger) {
      setError('Please upload both a bank statement and a general ledger.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLoadingMessageIndex(0);

    try {
      const [bankStatementPart, ledgerPart] = await Promise.all([
        fileToGenerativePart(bankStatement),
        fileToGenerativePart(ledger),
      ]);
      
      const reconciliationResult = await reconcileFiles(bankStatementPart, ledgerPart, model);
      setResult(reconciliationResult);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during reconciliation.');
    } finally {
      setIsLoading(false);
    }
  }, [bankStatement, ledger, model]);

  const handleReset = useCallback(() => {
    setBankStatement(null);
    setLedger(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessageIndex(0);
    setProgress(0);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      const currentLoadingMessage = loadingMessages[loadingMessageIndex];
      return (
        <div className="text-center w-full max-w-md">
          <Spinner />
           <div className="mt-6 w-full">
            <div className="flex justify-between mb-2">
              <p className="text-base font-medium text-slate-300">{currentLoadingMessage}</p>
              <p className="text-sm font-medium text-slate-300">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            This may take a moment for large files.
          </p>
        </div>
      );
    }

    if (result) {
      return <ReconciliationResults result={result} onReset={handleReset} />;
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUpload
              file={bankStatement}
              onFileSelect={setBankStatement}
              acceptedFileType=".pdf,.csv"
              label="Bank Statement"
              description="Upload statement in PDF or CSV format."
            />
            <FileUpload
              file={ledger}
              onFileSelect={setLedger}
              acceptedFileType=".pdf,.csv,.xlsx,.xls"
              label="General Ledger"
              description="Upload ledger in PDF, CSV or Excel format."
            />
          </div>
          {error && <p className="text-red-400 text-center mt-6">{error}</p>}
          <div className="mt-8 flex flex-col items-center justify-center gap-6">
            <ModelToggle selectedModel={model} onModelChange={setModel} />
            <button
              onClick={handleReconcile}
              disabled={!bankStatement || !ledger || isLoading}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Reconcile Files
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center font-sans bg-grid-slate-800/[0.2]">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <AppIcon />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100">
            Bank Reconciliation
          </h1>
        </div>
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
          Upload your bank statement and general ledger to let our AI automatically match transactions and identify discrepancies.
        </p>
      </div>
      {renderContent()}
    </div>
  );
};

export default App;
