import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReconciliationResult, Transaction, MatchedPair } from '../types';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);

// A separate formatter for PDF to use the currency code and avoid font compatibility issues with the 'GH₵' symbol.
const formatCurrencyForPdf = (amount: number) => new Intl.NumberFormat('en-GH', { 
    style: 'currency', 
    currency: 'GHS',
    currencyDisplay: 'code' // This will render as "GHS 123.45"
}).format(amount);


const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const generateCsv = (result: ReconciliationResult) => {
    const { summary, matchedTransactions, unmatchedBankTransactions, unmatchedLedgerEntries } = result;
    
    const toCsvRow = (arr: (string | number)[]) => arr.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    
    let csvContent = "";

    csvContent += "Summary\n";
    csvContent += toCsvRow(["Metric", "Value"]) + "\n";
    csvContent += toCsvRow(["Matched Count", summary.matchedCount]) + "\n";
    csvContent += toCsvRow(["Unmatched Bank Count", summary.unmatchedBankCount]) + "\n";
    csvContent += toCsvRow(["Unmatched Ledger Count", summary.unmatchedLedgerCount]) + "\n";
    csvContent += toCsvRow(["Matched Total", summary.matchedTotal]) + "\n";
    csvContent += toCsvRow(["Unmatched Bank Total", summary.unmatchedBankTotal]) + "\n";
    csvContent += toCsvRow(["Unmatched Ledger Total", summary.unmatchedLedgerTotal]) + "\n\n";

    csvContent += "Matched Transactions\n";
    csvContent += toCsvRow(["Bank Date", "Bank Description", "Ledger Date", "Ledger Description", "Amount"]) + "\n";
    matchedTransactions.forEach(p => {
        csvContent += toCsvRow([p.bankTransaction.date, p.bankTransaction.description, p.ledgerTransaction.date, p.ledgerTransaction.description, p.bankTransaction.amount]) + "\n";
    });
    csvContent += "\n";

    csvContent += "Unmatched Bank Transactions\n";
    csvContent += toCsvRow(["Date", "Description", "Amount"]) + "\n";
    unmatchedBankTransactions.forEach(tx => {
        csvContent += toCsvRow([tx.date, tx.description, tx.amount]) + "\n";
    });
    csvContent += "\n";

    csvContent += "Unmatched Ledger Entries\n";
    csvContent += toCsvRow(["Date", "Description", "Amount"]) + "\n";
    unmatchedLedgerEntries.forEach(tx => {
        csvContent += toCsvRow([tx.date, tx.description, tx.amount]) + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'reconciliation-report.csv');
};

export const generatePdf = (result: ReconciliationResult) => {
    const { summary, matchedTransactions, unmatchedBankTransactions, unmatchedLedgerEntries } = result;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(22);
    doc.text("Reconciliation Report", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

    // Summary Table
    autoTable(doc, {
        startY: 40,
        head: [['Summary Metric', 'Value']],
        body: [
            ['Matched Count', summary.matchedCount],
            ['Unmatched Bank Count', summary.unmatchedBankCount],
            ['Unmatched Ledger Count', summary.unmatchedLedgerCount],
            ['Matched Total', formatCurrencyForPdf(summary.matchedTotal)],
            ['Unmatched Bank Total', formatCurrencyForPdf(summary.unmatchedBankTotal)],
            ['Unmatched Ledger Total', formatCurrencyForPdf(summary.unmatchedLedgerTotal)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
    });
    
    const lastTableY = (doc as any).lastAutoTable.finalY;

    const addPageIfNeeded = (doc: jsPDF, yPosition: number) => {
        if (yPosition > pageHeight - 30) { // 30 is a margin
            doc.addPage();
            return 20; // Start Y for new page
        }
        return yPosition;
    };
    
    let currentY = addPageIfNeeded(doc, lastTableY + 15);

    // Matched Transactions
    autoTable(doc, {
        startY: currentY,
        head: [['Bank Date', 'Bank Description', 'Ledger Date', 'Ledger Description', 'Amount']],
        body: matchedTransactions.map((p: MatchedPair) => [
            p.bankTransaction.date,
            p.bankTransaction.description,
            p.ledgerTransaction.date,
            p.ledgerTransaction.description,
            formatCurrencyForPdf(p.bankTransaction.amount)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96] }, // Green
        didDrawPage: (data) => { currentY = data.cursor?.y ?? 20; }
    });
    
    currentY = addPageIfNeeded(doc, (doc as any).lastAutoTable.finalY + 15);
    
    // Unmatched Bank Transactions
    autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Description', 'Amount']],
        body: unmatchedBankTransactions.map((tx: Transaction) => [tx.date, tx.description, formatCurrencyForPdf(tx.amount)]),
        theme: 'grid',
        headStyles: { fillColor: [230, 126, 34] }, // Orange
        didDrawPage: (data) => { currentY = data.cursor?.y ?? 20; }
    });

    currentY = addPageIfNeeded(doc, (doc as any).lastAutoTable.finalY + 15);

    // Unmatched Ledger Entries
    autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Description', 'Amount']],
        body: unmatchedLedgerEntries.map((tx: Transaction) => [tx.date, tx.description, formatCurrencyForPdf(tx.amount)]),
        theme: 'grid',
        headStyles: { fillColor: [241, 196, 15] }, // Yellow
    });

    doc.save('reconciliation-report.pdf');
};