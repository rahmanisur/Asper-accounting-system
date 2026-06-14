import React, { useState } from "react";
import { Filter, Eye, Trash2, CheckCircle, Clock, AlertTriangle, FileText, Plus, X } from "lucide-react";
import { Invoice, InvoiceItem } from "../types";

interface Props {
  invoices: Invoice[];
  onSelectInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: Invoice["status"]) => void;
  onAddInvoice: (invoice: Omit<Invoice, "id">) => void;
}

export function InvoiceList({ invoices, onSelectInvoice, onDeleteInvoice, onUpdateStatus, onAddInvoice }: Props) {
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending" | "Overdue" | "Draft">("All");
  const [showManualForm, setShowManualForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Omit<InvoiceItem, "id">[]>([
    { description: "Development service", quantity: 1, unitPrice: 0 }
  ]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "All") return true;
    return inv.status === filter;
  });

  const handleAddField = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveField = (idx: number) => {
    const list = [...items];
    list.splice(idx, 1);
    setItems(list);
  };

  const handleItemValueChange = (idx: number, field: string, value: any) => {
    const list = [...items];
    list[idx] = {
      ...list[idx],
      [field]: value,
    };
    setItems(list);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceNumber) return;

    const formattedItems = items.map((it, idx) => ({
      ...it,
      id: `it_manual_${idx}_${Date.now()}`
    }));

    onAddInvoice({
      invoiceNumber,
      clientName,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, "")}@example.com`,
      clientCompany: clientCompany || undefined,
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: formattedItems,
      taxRate: taxRate || 0,
      discount: discount || 0,
      status: "Pending",
      notes: notes || undefined
    });

    // Reset Form
    setShowManualForm(false);
    setClientName("");
    setClientEmail("");
    setClientCompany("");
    setInvoiceNumber("");
    setIssueDate("");
    setDueDate("");
    setTaxRate(0);
    setDiscount(0);
    setNotes("");
    setItems([{ description: "Development service", quantity: 1, unitPrice: 0 }]);
  };

  const getStatusStyle = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "Pending":
        return "font-medium italic text-amber-900 border-amber-300 bg-amber-50/50";
      case "Overdue":
        return "font-bold text-red-950 border-red-500 bg-red-50/50";
      default:
        return "text-gray-600 bg-[#F5F3F0] border-gray-300";
    }
  };

  const calculateInvoiceTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (inv.taxRate / 100);
    const total = subtotal + tax - inv.discount;
    return total > 0 ? total : 0;
  };

  return (
    <div id="invoice-manager" className="bg-white border border-[#1A1A1A] p-8 flex flex-col gap-6 rounded-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EEE] pb-4">
        <div>
          <h2 className="text-xl font-serif italic text-[#1A1A1A]">Invoicing Ledger Registry</h2>
          <p className="text-xs text-gray-500 mt-1">Official statement registry, receivable credit cycles, and billing balances.</p>
        </div>
        <button
          id="add-invoice-manual-toggle"
          onClick={() => {
            setShowManualForm(!showManualForm);
            setInvoiceNumber(`INV-${Math.floor(10000 + Math.random() * 90000)}`);
            setIssueDate(new Date().toISOString().split("T")[0]);
            setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
          }}
          className="px-4 py-2 border border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          {showManualForm ? "Clear / Close Form" : "Create Manual Statement"}
        </button>
      </div>

      {showManualForm && (
        <form onSubmit={handleSubmit} id="manual-invoice-form" className="bg-[#F5F3F0]/60 border border-[#1A1A1A] rounded-none p-6 flex flex-col gap-4 text-xs">
          <h3 className="font-serif italic text-sm text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">Record Statement Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Name *</label>
              <input
                id="manual-client-name"
                required
                type="text"
                placeholder="Jane Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Email</label>
              <input
                id="manual-client-email"
                type="email"
                placeholder="jane@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Company</label>
              <input
                id="manual-client-company"
                type="text"
                placeholder="Acme Corp"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Invoice Code # *</label>
              <input
                id="manual-invoice-num"
                required
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden font-mono text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issue Date *</label>
              <input
                id="manual-issue-date"
                required
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Due Date *</label>
              <input
                id="manual-due-date"
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tax (%)</label>
                <input
                  id="manual-tax-rate"
                  type="number"
                  min="0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs font-mono text-right"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Discount($)</label>
                <input
                  id="manual-discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs font-mono text-right"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 border border-[#1A1A1A] rounded-none mt-2">
            <div className="flex justify-between items-center mb-2 border-b border-[#EEE] pb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Deliverable Items</span>
              <button
                id="manual-add-item-row"
                type="button"
                onClick={handleAddField}
                className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Plus size={11} />
                Insert Row
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} id={`manual-row-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end py-1">
                <div className="md:col-span-6 flex flex-col gap-1">
                  <label className="text-[9px] text-[#1A1A1A] uppercase tracking-widest font-bold">Brief Description *</label>
                  <input
                    id={`manual-item-desc-${idx}`}
                    required
                    type="text"
                    placeholder="e.g., Logo design, consulting cycle..."
                    value={item.description}
                    onChange={(e) => handleItemValueChange(idx, "description", e.target.value)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none text-xs"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] text-[#1A1A1A] uppercase tracking-widest font-bold text-right">Units / Hrs</label>
                  <input
                    id={`manual-item-qty-${idx}`}
                    required
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemValueChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none text-xs text-right font-mono"
                  />
                </div>
                <div className="md:col-span-3 flex flex-col gap-1">
                  <label className="text-[9px] text-[#1A1A1A] uppercase tracking-widest font-bold text-right">Unit Rate ($)</label>
                  <input
                    id={`manual-item-price-${idx}`}
                    required
                    type="number"
                    min="0"
                    placeholder="120"
                    value={item.unitPrice}
                    onChange={(e) => handleItemValueChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="p-2 border border-[#1A1A1A] bg-white rounded-none text-xs text-right font-mono"
                  />
                </div>
                <div className="md:col-span-1 text-center py-1 flex justify-center">
                  <button
                    id={`manual-del-row-${idx}`}
                    type="button"
                    disabled={items.length === 1}
                    onClick={() => handleRemoveField(idx)}
                    className="text-gray-400 hover:text-black disabled:opacity-30 p-1.5 cursor-pointer flex items-center justify-center border border-transparent hover:border-[#1A1A1A]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Additional Terms & Wire notes</label>
            <textarea
              id="manual-notes"
              rows={2}
              placeholder="e.g. Thanks for your business. Net-15 wire instructions."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-3 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs italic"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              id="manual-form-cancel"
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-4 py-2 border border-[#1A1A1A] hover:bg-gray-100 text-[#1A1A1A] rounded-none text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="manual-form-submit"
              type="submit"
              className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-opacity-90 rounded-none text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Book Invoice Stat
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto border-b border-[#1A1A1A] pb-3" id="invoice-tabs">
        {(["All", "Paid", "Pending", "Overdue", "Draft"] as const).map((tab) => (
          <button
            id={`tab-filter-${tab}`}
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
              filter === tab ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" : "bg-[#F5F3F0] hover:bg-[#1A1A1A] hover:text-white border-[#1A1A1A]/40 text-gray-700"
            }`}
          >
            {tab}
            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded-sm ${filter === tab ? "bg-white/20 text-white font-mono" : "bg-gray-200 text-gray-600 font-mono"}`}>
              {tab === "All" ? invoices.length : invoices.filter((i) => i.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-800" id="invoices-ledger-table">
          <thead>
            <tr className="border-b border-[#1A1A1A] uppercase text-gray-500 font-bold tracking-widest text-[9px]">
              <th className="pb-4 pl-2 w-[12%] font-bold">Statement #</th>
              <th className="pb-4 w-[25%] font-bold">Acquire Customer Account</th>
              <th className="pb-4 w-[18%] font-bold">Filing Due Timeline</th>
              <th className="pb-4 w-[15%] text-right font-bold">Cost Billed ($)</th>
              <th className="pb-4 w-[15%] text-center font-bold">Filing status</th>
              <th className="pb-4 pr-2 w-[15%] text-right font-bold">Audit Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE]">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} id={`invoice-row-${inv.id}`} className="hover:bg-[#F5F3F0]/30 transition-colors group">
                <td className="py-4 pl-2 font-bold font-mono text-[#1A1A1A]">
                  {inv.invoiceNumber}
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#1A1A1A]">{inv.clientName}</span>
                    <span className="text-gray-400 font-mono text-[10px] break-all" title={inv.clientEmail}>{inv.clientEmail}</span>
                    {inv.clientCompany && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] border-l border-[#1A1A1A] pl-1.5 mt-1">
                        {inv.clientCompany}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 text-[#1A1A1A]">
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span>Issued: <span className="font-mono text-[11px]">{inv.issueDate}</span></span>
                    <span className={inv.status === "Overdue" ? "text-red-700 font-bold" : ""}>
                      Due: <span className="font-mono text-[11px]">{inv.dueDate}</span>
                    </span>
                  </div>
                </td>
                <td className="py-4 text-right font-mono font-bold text-[#1A1A1A] text-xs">
                  ${calculateInvoiceTotal(inv).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-center">
                  <div className="flex justify-center">
                    <select
                      id={`status-selector-${inv.id}`}
                      value={inv.status}
                      onChange={(e) => onUpdateStatus(inv.id, e.target.value as Invoice["status"])}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide border rounded-none focus:outline-hidden cursor-pointer flex items-center justify-center text-center outline-none ${getStatusStyle(inv.status)}`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </td>
                <td className="py-4 pr-2 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      id={`invoice-eye-${inv.id}`}
                      onClick={() => onSelectInvoice(inv)}
                      type="button"
                      title="View PDF / Print Invoice"
                      className="p-1 px-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                    >
                      Print Sheet
                    </button>
                    <button
                      id={`invoice-del-${inv.id}`}
                      type="button"
                      onClick={() => onDeleteInvoice(inv.id)}
                      title="Void / Delete"
                      className="p-1 px-2 text-[#1A1A1A] border border-transparent hover:border-red-600 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Void
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                  No invoices belong to this register filter. Use Prompt Copilot above to generate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
