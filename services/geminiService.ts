import type { ReconciliationResult } from '../types';

interface FilePart {
  mimeType: string;
  data: string;
}

export const reconcileFiles = async (
  bankStatementPart: FilePart,
  ledgerPart: FilePart,
  modelType: 'flash' | 'pro'
): Promise<ReconciliationResult> => {
  try {
    const response = await fetch('/.netlify/functions/reconcile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankStatementPart,
        ledgerPart,
        modelType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during reconciliation.' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    return result as ReconciliationResult;
    
  } catch (error) {
    console.error("Error calling reconciliation function:", error);
    throw new Error(error instanceof Error ? error.message : "An unknown network error occurred.");
  }
};
