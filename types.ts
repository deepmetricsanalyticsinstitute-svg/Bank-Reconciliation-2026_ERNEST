
export interface Transaction {
  date: string;
  description: string;
  amount: number;
}

export interface MatchedPair {
  bankTransaction: Transaction;
  ledgerTransaction: Transaction;
}

export interface ReconciliationResult {
  summary: {
    matchedCount: number;
    unmatchedBankCount: number;
    unmatchedLedgerCount: number;
    matchedTotal: number;
    unmatchedBankTotal: number;
    unmatchedLedgerTotal: number;
  };
  matchedTransactions: MatchedPair[];
  unmatchedBankTransactions: Transaction[];
  unmatchedLedgerEntries: Transaction[];
}
