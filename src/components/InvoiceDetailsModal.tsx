import React, { useRef } from "react";
import { X, Printer, Landmark, Building, Receipt } from "lucide-react";
import { Invoice } from "../types";

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailsModal({ invoice, onClose }: Props) {
  if (!invoice) return null;

  const invoiceRef = useRef<HTMLDivElement>(null);

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax - invoice.discount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
      <div className="bg-white rounded-none shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[92vh] border-2 border-[#1A1A1A] animate-in fade-in zoom-in duration-150">
        
        {/* Header - Non-Printable */}
        <div id="modal-header" className="flex items-center justify-between px-6 py-4 border-b border-[#1A1A1A] bg-[#F5F3F0] print:hidden">
          <span className="text-[11px] font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Receipt size={14} className="text-[#1A1A1A]" />
            Statement of Account: {invoice.invoiceNumber}
          </span>
          <div className="flex items-center gap-2">
            <button
              id="print-invoice-btn"
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-white hover:text-[#1A1A1A] border border-[#1A1A1A] text-white rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Print / Save PDF
            </button>
            <button
              id="close-modal-btn"
              onClick={onClose}
              type="button"
              className="p-1 px-3 text-[#1A1A1A] hover:bg-[#F5F3F0] border border-transparent hover:border-[#1A1A1A] rounded-none cursor-pointer text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Main Sheet */}
        <div ref={invoiceRef} id="invoice-sheet" className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-xs text-gray-800 leading-relaxed print_canvas font-sans">
          
          {/* Print specific header styles if printed */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #invoice-sheet, #invoice-sheet * {
                visibility: visible;
              }
              #invoice-sheet {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 2rem !important;
                box-shadow: none;
                border: none;
              }
              .print-hidden {
                display: none !important;
              }
            }
          `}} />

          {/* Business branding & Invoice details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#1A1A1A] pb-8 mb-8">
            <div>
              <h1 className="text-2xl font-serif italic font-light tracking-tight text-[#1A1A1A]">
                Simon Design Apps
              </h1>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-1.5 tracking-widest">Bookkeeping & Software consultancy</p>
              <div className="mt-4 text-gray-600 flex flex-col gap-1 font-sans text-xs">
                <span>120 Technology Row, Suite 400</span>
                <span>Boston, MA 02111</span>
                <span>billing@simonapps.co</span>
              </div>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end">
              <span className={`px-2.5 py-0.5 mt-0.5 rounded-none text-[9px] font-bold border uppercase tracking-wider text-center ${
                invoice.status === "Paid" ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                invoice.status === "Pending" ? "bg-amber-50 text-amber-900 border-amber-300 italic" :
                invoice.status === "Overdue" ? "bg-red-50 text-red-950 border-red-400 font-bold" :
                "bg-[#F5F3F0] text-gray-700 border-gray-300"
              }`}>
                {invoice.status}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-3 font-mono tracking-tight">{invoice.invoiceNumber}</h2>
              <div className="mt-2 text-gray-600 font-medium flex flex-col sm:items-end gap-1 font-sans text-xs">
                <span><span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold mr-1">Issued:</span> {invoice.issueDate}</span>
                <span><span className="text-gray-400 uppercase tracking-wider text-[9px] font-bold mr-1">Due Date:</span> {invoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Client relationships */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F5F3F0]/60 rounded-none p-5 border border-[#1A1A1A] mb-8">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Building size={12} className="text-[#1A1A1A]" />
                Customer Details
              </p>
              <div className="text-gray-800 flex flex-col gap-1 font-sans">
                <span className="font-bold text-[#1A1A1A]">{invoice.clientName}</span>
                {invoice.clientCompany && <span className="font-bold text-gray-600 text-xs">{invoice.clientCompany}</span>}
                <span className="text-gray-600 font-mono text-[11px]">{invoice.clientEmail}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Landmark size={12} className="text-[#1A1A1A]" />
                Settlement Instruct
              </p>
              <div className="text-gray-600 flex flex-col gap-1 font-sans">
                <span>Bank Code: <span className="font-mono text-[#1A1A1A] font-bold">SIMON-SV-9912</span></span>
                <span>Branch: <span className="text-gray-800 font-medium">Federal Financial Plaza</span></span>
                <span>Beneficiary: <span className="text-[#1A1A1A] font-bold">Simon Design Apps LLC</span></span>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <p className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest mb-3">Service Deliverables Ledger</p>
            <table className="w-full text-left font-sans text-xs" id="receipt-table">
              <thead>
                <tr className="border-b border-[#1A1A1A] text-gray-500 font-bold uppercase tracking-widest text-[9px] pb-2">
                  <th className="pb-2 w-[55%] font-bold">Service Description</th>
                  <th className="pb-2 text-right w-[15%] font-bold">Units / Hours</th>
                  <th className="pb-2 text-right w-[15%] font-bold">Rate</th>
                  <th className="pb-2 text-right w-[15%] font-bold">Sum ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE]">
                {invoice.items.map((item) => (
                  <tr key={item.id} id={`receipt-row-${item.id}`}>
                    <td className="py-3.5 font-bold text-[#1A1A1A] font-sans">{item.description}</td>
                    <td className="py-3.5 text-right font-mono text-gray-600">{item.quantity}</td>
                    <td className="py-3.5 text-right font-mono text-gray-600">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-[#1A1A1A]">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Arithmetic block */}
          <div className="mt-8 pt-6 border-t border-[#1A1A1A] flex flex-col items-end gap-2 font-mono text-xs">
            <div className="flex justify-between w-64 text-gray-600">
              <span className="font-sans text-xs">Section Sub-Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span className="font-sans text-xs">Surcharge Tax ({invoice.taxRate}%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span className="font-sans text-xs">Promo Coupon Discount:</span>
              <span>-${invoice.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 font-bold text-[#1A1A1A] border-t border-[#1A1A1A] pt-2 text-sm">
              <span className="font-sans text-xs uppercase tracking-wider">Gross Balance Due:</span>
              <span className="text-[#1A1A1A] font-bold">${total > 0 ? total.toFixed(2) : "0.00"}</span>
            </div>
          </div>

          {/* Footnotes */}
          <div className="mt-12 border-t border-[#1A1A1A] pt-6 text-left">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Filing guidelines & Retentions</p>
            <p className="text-gray-500 text-[10px] leading-relaxed italic">
              {invoice.notes || "Standard net-30 terms apply to all software, digital design, and bookkeeping cycles. Thank you for your partnership. Contact billing representatives for support."}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
