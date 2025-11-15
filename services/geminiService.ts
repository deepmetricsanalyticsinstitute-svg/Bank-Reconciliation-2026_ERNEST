import { GoogleGenAI, Type } from "@google/genai";
import type { ReconciliationResult } from '../types';

// FIX: Replaced import.meta.env.VITE_API_KEY with process.env.API_KEY to adhere to Gemini API guidelines and resolve the TypeScript error.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY environment variable is not set. Please configure it in your deployment settings.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        matchedCount: { type: Type.INTEGER },
        unmatchedBankCount: { type: Type.INTEGER },
        unmatchedLedgerCount: { type: Type.INTEGER },
        matchedTotal: { type: Type.NUMBER },
        unmatchedBankTotal: { type: Type.NUMBER },
        unmatchedLedgerTotal: { type: Type.NUMBER },
      },
    },
    matchedTransactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          bankTransaction: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
            },
          },
          ledgerTransaction: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
            },
          },
        },
      },
    },
    unmatchedBankTransactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
        },
      },
    },
    unmatchedLedgerEntries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER },
        },
      },
    },
  },
};

interface FilePart {
  mimeType: string;
  data: string;
}

export const reconcileFiles = async (
  bankStatementPart: FilePart,
  ledgerPart: FilePart,
  modelType: 'flash' | 'pro'
): Promise<ReconciliationResult> => {
  const model = modelType === 'pro' ? "gemini-2.5-pro" : "gemini-2.5-flash";
  const systemInstruction = `You are an expert AI accountant specializing in financial data analysis and bank reconciliation. Your task is to accurately parse a bank statement (PDF) and a general ledger (CSV/Excel), match transactions, and provide a clear reconciliation report in the specified JSON format.
  
  Instructions:
  1.  Analyze the provided PDF bank statement and CSV/Excel general ledger.
  2.  Extract all transactions from both documents, identifying date, description, and amount. Normalize amounts to positive numbers. Be robust to potential OCR errors in the PDF and variations in date formats.
  3.  Match transactions between the two documents. The primary matching criteria should be an identical amount. The secondary criteria is a date that is very close (within a 3-day tolerance). Description similarity can be a tertiary factor.
  4.  Categorize all transactions into three groups:
      - Matched Transactions: Pairs of transactions that exist in both documents.
      - Unmatched Bank Transactions: Items on the bank statement but not in the ledger.
      - Unmatched Ledger Entries: Items in the ledger but not on the bank statement.
  5.  Calculate a summary including counts and total amounts for each category.
  6.  Return the final report strictly following the provided JSON schema. Ensure all dates are in 'YYYY-MM-DD' format.`;

  const prompt = `Please perform a bank reconciliation on the following two documents.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: bankStatementPart.mimeType,
                data: bankStatementPart.data,
              },
            },
            {
              inlineData: {
                mimeType: ledgerPart.mimeType,
                data: ledgerPart.data,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        // FIX: Moved systemInstruction inside the config object as per the API guidelines.
        systemInstruction: systemInstruction,
      },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ReconciliationResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid reconciliation from the AI. The document formats might be unsupported or the API request failed. Try using Accuracy mode for complex documents.");
  }
};
