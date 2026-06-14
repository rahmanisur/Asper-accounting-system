export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number; // as percentage, e.g. 5 for 5%
  discount: number; // absolute dollar discount
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  notes?: string;
}

export interface OutgoingPayment {
  id: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Scheduled';
  notes?: string;
}

export interface BusinessStats {
  totalInvoiced: number;
  totalCollected: number;
  totalOutgoing: number;
  outstandingReceivables: number;
}
