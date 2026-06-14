import React, { useState } from "react";
import { Sparkles, Loader2, Plus, Trash2, ArrowRight, Check, AlertCircle } from "lucide-react";
import { Invoice, InvoiceItem } from "../types";

interface Props {
  onAddInvoice: (invoice: Omit<Invoice, "id">) => void;
}

const templates = [
  "Invoice Apple Inc (billing@apple.com) for 32 hours of mobile consulting at $135/hr and $200 device purchase fee. Set standard net-30 due date, with 5% tax rate and a discount of $150.",
  "Create invoice to Google LLC (ap@google.com) for a 3-day cloud migration workshop on June 10-12 at $2500 per day with zero tax and notes saying thank you.",
  "Bill Simon Anisur (simon@gmail.com) for 5 website pages designed at $400 each, plus custom logo design at $750. Apply 8% tax."
];

export function AISmartCreator({ onAddInvoice }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<{
    clientName: string;
    clientEmail: string;
    clientCompany?: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    items: Omit<InvoiceItem, "id">[];
    taxRate: number;
    discount: number;
    notes?: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setPreviewInvoice(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/gemini/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || "Failed to process AI request");
      }

      const invoiceData = await response.json();
      setPreviewInvoice({
        clientName: invoiceData.clientName || "",
        clientEmail: invoiceData.clientEmail || "",
        clientCompany: invoiceData.clientCompany || "",
        invoiceNumber: invoiceData.invoiceNumber || `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: invoiceData.issueDate || new Date().toISOString().split("T")[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        items: invoiceData.items || [],
        taxRate: typeof invoiceData.taxRate === "number" ? invoiceData.taxRate : 0,
        discount: typeof invoiceData.discount === "number" ? invoiceData.discount : 0,
        notes: invoiceData.notes || "Generated via Bookkeeping AI automation."
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewFieldChange = (field: string, value: any) => {
    if (!previewInvoice) return;
    setPreviewInvoice({
      ...previewInvoice,
      [field]: value,
    });
  };

  const handlePreviewItemChange = (index: number, field: string, value: any) => {
    if (!previewInvoice) return;
    const updatedItems = [...previewInvoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setPreviewInvoice({
      ...previewInvoice,
      items: updatedItems,
    });
  };

  const handleAddPreviewItem = () => {
    if (!previewInvoice) return;
    setPreviewInvoice({
      ...previewInvoice,
      items: [...previewInvoice.items, { description: "New Item", quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemovePreviewItem = (index: number) => {
    if (!previewInvoice) return;
    const items = [...previewInvoice.items];
    items.splice(index, 1);
    setPreviewInvoice({
      ...previewInvoice,
      items,
    });
  };

  const handleSaveInvoice = () => {
    if (!previewInvoice) return;
    
    // Convert preview Omit<InvoiceItem, "id">[] items into unique IDs
    const itemsWithIds: InvoiceItem[] = previewInvoice.items.map((it, idx) => ({
      ...it,
      id: `item_gen_${idx}_${Date.now()}`,
    }));

    onAddInvoice({
      invoiceNumber: previewInvoice.invoiceNumber,
      clientName: previewInvoice.clientName,
      clientEmail: previewInvoice.clientEmail,
      clientCompany: previewInvoice.clientCompany,
      issueDate: previewInvoice.issueDate,
      dueDate: previewInvoice.dueDate,
      items: itemsWithIds,
      taxRate: previewInvoice.taxRate,
      discount: previewInvoice.discount,
      status: "Pending", // Default is Unpaid/Pending
      notes: previewInvoice.notes,
    });

    setPreviewInvoice(null);
    setPrompt("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Helper calculation
  const calculatePreviewSubtotal = () => {
    if (!previewInvoice) return 0;
    return previewInvoice.items.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  };

  const previewSubtotal = calculatePreviewSubtotal();
  const previewTax = previewInvoice ? previewSubtotal * (previewInvoice.taxRate / 100) : 0;
  const previewTotal = previewInvoice ? (previewSubtotal + previewTax - previewInvoice.discount) : 0;

  return (
    <div id="ai-creator-panel" className="bg-white border border-[#1A1A1A] p-8 flex flex-col gap-6 rounded-none">
      <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
        <div>
          <h2 className="text-xl font-serif italic font-light text-[#1A1A1A] flex items-center gap-2">
            <Sparkles size={16} className="text-[#1A1A1A]" />
            Automatic Invoice Copilot
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Describe client deliverables below. The intelligent parser will instantly structure dates, taxes, discounts, and line-item totals.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div id="save-success-notification" className="bg-[#F5F3F0] text-[#1A1A1A] p-4 flex items-center gap-3 border border-[#1A1A1A]">
          <div className="p-1 bg-[#1A1A1A] text-white rounded-full">
            <Check size={14} />
          </div>
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">Statement Committed</p>
            <p className="text-xs italic opacity-80 mt-0.5">The invoice has been booked and added to your ledger below.</p>
          </div>
        </div>
      )}

      {/* templates area */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Transcribe Templates
        </label>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {templates.map((tmpl, idx) => (
            <button
              id={`quick-template-${idx}`}
              key={idx}
              type="button"
              onClick={() => setPrompt(tmpl)}
              className="text-left text-xs bg-[#F5F3F0] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] p-4 rounded-none cursor-pointer transition-colors border border-[#1A1A1A] flex flex-col justify-between group h-full"
            >
              <span className="line-clamp-3 text-slate-800 group-hover:text-amber-50 font-sans italic my-1">
                "{tmpl}"
              </span>
              <span className="flex items-center gap-1.5 mt-3 font-bold uppercase tracking-wider text-[9px] text-[#1A1A1A] group-hover:text-white">
                Apply Draft <ArrowRight size={11} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 relative">
        <textarea
          id="ai-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Charge Simon Anisur at simon@gmail.com for 10 hours of design at $80 and domain setup fee of $25. Out of court settlement: discount $50"
          className="w-full min-h-[100px] p-4 text-xs font-sans bg-white border border-[#1A1A1A] rounded-none focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] resize-none transition-all placeholder:text-gray-400 text-[#1A1A1A]"
        />

        {error && (
          <div id="ai-error-box" className="bg-red-50 text-red-950 p-4 rounded-none flex items-start gap-3 border border-red-900 text-xs">
            <AlertCircle size={15} className="text-red-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Extraction Fault</p>
              <p className="text-red-700 mt-0.5 italic">{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {prompt && (
            <button
              id="clear-prompt-btn"
              type="button"
              onClick={() => setPrompt("")}
              className="px-4 py-2 border border-gray-300 text-gray-500 hover:bg-gray-100 rounded-none text-xs transition-all font-bold uppercase tracking-widest cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            id="ai-generate-submit-btn"
            type="button"
            disabled={loading || !prompt.trim()}
            onClick={handleGenerate}
            className="px-5 py-3.5 bg-[#1A1A1A] text-white hover:bg-[#F5F3F0] hover:text-[#1A1A1A] border border-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all shrink-0 rounded-none"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Processing transcription...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </div>

      {previewInvoice && (
        <div id="ai-preview-panel" className="border border-[#1A1A1A] bg-[#FDFCFB] rounded-none p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#1A1A1A] pb-4">
            <div>
              <h3 className="text-sm font-serif italic text-slate-900 flex items-center gap-1.5">
                <Check size={16} className="text-emerald-700" />
                Structured Draft Preview
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review extracted financial statements before writing to ledger.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                id="discard-preview-btn"
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="px-3.5 py-2 border border-[#1A1A1A] bg-white hover:bg-gray-100 text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer"
              >
                Discard
              </button>
              <button
                id="book-ledger-btn"
                type="button"
                onClick={handleSaveInvoice}
                className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-opacity-90 text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer flex items-center gap-1.5"
              >
                Book to Ledger
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* Client Info */}
            <div className="flex flex-col gap-2 bg-[#F5F3F0]/50 p-4 border border-[#1A1A1A] rounded-none">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Customer Account</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-500 font-medium">Name</label>
                <input
                  id="preview-client-name"
                  type="text"
                  value={previewInvoice.clientName}
                  onChange={(e) => handlePreviewFieldChange("clientName", e.target.value)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-gray-500 font-medium">Email</label>
                <input
                  id="preview-client-email"
                  type="email"
                  value={previewInvoice.clientEmail}
                  onChange={(e) => handlePreviewFieldChange("clientEmail", e.target.value)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden"
                />
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-gray-500 font-medium">Company</label>
                <input
                  id="preview-client-company"
                  type="text"
                  value={previewInvoice.clientCompany || ""}
                  onChange={(e) => handlePreviewFieldChange("clientCompany", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden"
                />
              </div>
            </div>

            {/* Basic Parameters */}
            <div className="flex flex-col gap-2 bg-[#F5F3F0]/50 p-4 border border-[#1A1A1A] rounded-none">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Filing Specifics</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-500 font-medium">Invoice Serial #</label>
                <input
                  id="preview-invoice-num"
                  type="text"
                  value={previewInvoice.invoiceNumber}
                  onChange={(e) => handlePreviewFieldChange("invoiceNumber", e.target.value)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium">Issue Date</label>
                  <input
                    id="preview-issue-date"
                    type="date"
                    value={previewInvoice.issueDate}
                    onChange={(e) => handlePreviewFieldChange("issueDate", e.target.value)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium">Due Date</label>
                  <input
                    id="preview-due-date"
                    type="date"
                    value={previewInvoice.dueDate}
                    onChange={(e) => handlePreviewFieldChange("dueDate", e.target.value)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium font-serif italic">Tax Rate (%)</label>
                  <input
                    id="preview-tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={previewInvoice.taxRate}
                    onChange={(e) => handlePreviewFieldChange("taxRate", parseFloat(e.target.value) || 0)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-right font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium font-serif italic">Discount ($)</label>
                  <input
                    id="preview-discount"
                    type="number"
                    min="0"
                    value={previewInvoice.discount}
                    onChange={(e) => handlePreviewFieldChange("discount", parseFloat(e.target.value) || 0)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-right font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Substructures */}
            <div className="flex flex-col justify-between bg-[#F5F3F0]/50 p-4 border border-[#1A1A1A] rounded-none">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Audit Memorandums</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 font-medium font-serif italic">Statement notes</label>
                  <textarea
                    id="preview-notes"
                    value={previewInvoice.notes || ""}
                    onChange={(e) => handlePreviewFieldChange("notes", e.target.value)}
                    rows={4}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden resize-none h-[110px]"
                  />
                </div>
              </div>
              <div className="bg-[#1A1A1A] text-white p-2.5 rounded-none border border-[#1A1A1A] flex items-center justify-between mt-2 font-mono">
                <span className="text-[10px] uppercase tracking-wider font-semibold">Total cost sum:</span>
                <span className="font-bold">${previewTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Lines Preview */}
          <div className="bg-white rounded-none border border-[#1A1A1A] p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statement Utilization breakdown</span>
              <button
                id="preview-add-item-btn"
                type="button"
                onClick={handleAddPreviewItem}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-800 hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} />
                Insert Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700" id="preview-items-table">
                <thead>
                  <tr className="border-b border-[#1A1A1A] text-gray-500 font-bold uppercase tracking-widest text-[9px]">
                    <th className="pb-2 w-[45%] font-bold">Service deliverables</th>
                    <th className="pb-2 w-[15%] text-right">Qty / Hrs</th>
                    <th className="pb-2 w-[20%] text-right font-bold">Rate</th>
                    <th className="pb-2 w-[15%] text-right">Value ($)</th>
                    <th className="pb-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE]/60">
                  {previewInvoice.items.map((it, idx) => (
                    <tr key={idx} id={`preview-row-${idx}`}>
                      <td className="py-2.5">
                        <input
                          id={`preview-item-desc-${idx}`}
                          type="text"
                          value={it.description}
                          onChange={(e) => handlePreviewItemChange(idx, "description", e.target.value)}
                          className="w-full p-1 border-b border-transparent hover:border-gray-300 focus:border-[#1A1A1A] focus:outline-hidden rounded-none"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          id={`preview-item-qty-${idx}`}
                          type="number"
                          step="any"
                          value={it.quantity}
                          onChange={(e) => handlePreviewItemChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                          className="w-16 p-1 border-b border-transparent hover:border-gray-300 focus:border-[#1A1A1A] focus:outline-hidden rounded-none text-right font-mono"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          id={`preview-item-price-${idx}`}
                          type="number"
                          step="any"
                          value={it.unitPrice}
                          onChange={(e) => handlePreviewItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 border-b border-transparent hover:border-gray-300 focus:border-[#1A1A1A] focus:outline-hidden rounded-none text-right font-mono"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-gray-900">
                        ${(it.quantity * it.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          id={`preview-row-del-${idx}`}
                          type="button"
                          onClick={() => handleRemovePreviewItem(idx)}
                          className="text-gray-400 hover:text-[#1A1A1A] p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {previewInvoice.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400 italic">
                        No service rows configured. Please insert a line row.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1A1A1A] flex flex-col items-end text-xs gap-1.5 font-mono">
              <div className="flex justify-between w-48 text-gray-500 text-[11px]">
                <span>Section Subtotal:</span>
                <span>${previewSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-gray-500 text-[11px]">
                <span>Sales Tax ({previewInvoice.taxRate}%):</span>
                <span>${previewTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-gray-500 text-[11px]">
                <span>Promo Discount:</span>
                <span>-${previewInvoice.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 font-bold text-[#1A1A1A] border-t border-[#1A1A1A] pt-1.5 text-xs">
                <span>Gross settled:</span>
                <span>${previewTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
