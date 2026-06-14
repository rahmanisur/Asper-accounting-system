import React, { useState } from "react";
import { Plus, X, Search, Tag, Calendar, DollarSign, Trash2 } from "lucide-react";
import { OutgoingPayment } from "../types";

interface Props {
  payments: OutgoingPayment[];
  onAddPayment: (payment: Omit<OutgoingPayment, "id">) => void;
  onDeletePayment: (id: string) => void;
  onUpdatePaymentStatus: (id: string, status: OutgoingPayment["status"]) => void;
}

const CATEGORIES = [
  "Hosting & Infrastructure",
  "Software Subscriptions",
  "Contractors & Freelancers",
  "Rent & Office Space",
  "Marketing & Advertising",
  "Meals & Entertainment",
  "Office Supplies",
  "Legal & Finance",
  "Other Accounts Payable"
];

export function ExpenseList({ payments, onAddPayment, onDeletePayment, onUpdatePaymentStatus }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<OutgoingPayment["status"]>("Paid");
  const [notes, setNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Pending" | "Scheduled">("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount || !date) return;

    onAddPayment({
      vendor,
      category,
      amount: parseFloat(amount) || 0,
      date,
      status,
      notes: notes || undefined
    });

    // Reset
    setShowForm(false);
    setVendor("");
    setCategory(CATEGORIES[0]);
    setAmount("");
    setDate("");
    setStatus("Paid");
    setNotes("");
  };

  const filteredPayments = payments.filter((pay) => {
    const matchesSearch = pay.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (pay.notes && pay.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || pay.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || pay.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusStyle = (status: OutgoingPayment["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "Pending":
        return "bg-amber-50/50 text-amber-900 border-amber-300 italic";
      case "Scheduled":
        return "bg-indigo-50/50 text-indigo-900 border-indigo-300 italic";
      default:
        return "bg-[#F5F3F0] text-gray-700 border-gray-300";
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Hosting & Infrastructure":
        return "bg-purple-50 text-purple-800 border-purple-300";
      case "Software Subscriptions":
        return "bg-sky-50 text-sky-800 border-sky-300";
      case "Contractors & Freelancers":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "Rent & Office Space":
        return "bg-emerald-50 text-emerald-800 border-emerald-305";
      case "Marketing & Advertising":
        return "bg-rose-50 text-rose-800 border-rose-300";
      default:
        return "bg-[#F5F3F0] text-gray-700 border-[#1A1A1A]/25";
    }
  };

  return (
    <div id="outgoing-payments" className="bg-white border border-[#1A1A1A] p-8 flex flex-col gap-6 rounded-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#EEE] pb-4">
        <div>
          <h2 className="text-xl font-serif italic text-[#1A1A1A]">Expenditures Ledger</h2>
          <p className="text-xs text-gray-500 mt-1">Track disbursements, scheduled bills, service fees, utilities, and contractor accounts.</p>
        </div>
        <button
          id="add-payment-drawer-toggle"
          onClick={() => {
            setShowForm(!showForm);
            setDate(new Date().toISOString().split("T")[0]);
          }}
          className="px-4 py-2 border border-[#1A1A1A] bg-white text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          {showForm ? "Close Form" : "Add New Expenditure"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} id="payment-form" className="bg-[#F5F3F0]/60 border border-[#1A1A1A] rounded-none p-6 flex flex-col gap-4 text-xs">
          <h3 className="font-serif italic text-sm text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">Record Expenditure Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payee / Vendor Name *</label>
              <input
                id="expense-vendor"
                required
                type="text"
                placeholder="AWS, Sarah (Freelancer)..."
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Account Classification *</label>
              <select
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Value ($) *</label>
                <input
                  id="expense-amount"
                  required
                  type="number"
                  step="any"
                  min="0"
                  placeholder="250.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payment Date *</label>
                <input
                  id="expense-date"
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disbursement Status *</label>
              <div className="flex items-center gap-4 mt-1">
                {(["Paid", "Pending", "Scheduled"] as const).map((stat) => (
                  <label key={stat} className="flex items-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider text-[10px] text-gray-700">
                    <input
                      id={`pay-status-radio-${stat.toLowerCase()}`}
                      type="radio"
                      name="payment-status"
                      checked={status === stat}
                      onChange={() => setStatus(stat)}
                      className="accent-[#1A1A1A] cursor-pointer"
                    />
                    {stat}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accounting Memo / Details</label>
              <input
                id="expense-notes"
                type="text"
                placeholder="Invoice reference, contract memo etc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="p-2 border border-[#1A1A1A] bg-white rounded-none focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              id="payment-cancel-btn"
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#1A1A1A] hover:bg-gray-100 text-[#1A1A1A] rounded-none text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="payment-submit-btn"
              type="submit"
              className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-opacity-90 rounded-none text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Commit Outgoing Stat
            </button>
          </div>
        </form>
      )}

      {/* Searching & Quick Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center border-t border-[#EEE] pt-4" id="expenses-utilities-bar">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="expense-search"
            type="text"
            placeholder="Search payee or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#1A1A1A] rounded-none focus:outline-hidden"
          />
        </div>

        {/* Category select Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest shrink-0 flex items-center gap-1.5">
            <Tag size={12} /> classification:
          </span>
          <select
            id="category-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 py-1 bg-white border border-[#1A1A1A] rounded-none text-xs text-[#1A1A1A] cursor-pointer w-full md:w-auto focus:outline-hidden"
          >
            <option value="All">All Classifications</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status tab filter */}
        <div className="flex items-center gap-1.5 ml-auto w-full md:w-auto justify-end overflow-x-auto">
          {(["All", "Paid", "Pending", "Scheduled"] as const).map((tab) => (
            <button
              id={`expense-status-tab-${tab}`}
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors border ${
                statusFilter === tab ? "bg-[#1A1A1A] border-[#1A1A1A] text-white" : "bg-[#F5F3F0] border-[#1A1A1A]/40 text-gray-600 hover:bg-[#1A1A1A] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-800" id="outgoing-payments-table">
          <thead>
            <tr className="border-b border-[#1A1A1A] uppercase text-gray-500 font-bold tracking-widest text-[9px]">
              <th className="pb-4 pl-2 w-[25%] font-bold">Payee / Recipient</th>
              <th className="pb-4 w-[25%] font-bold">Classification Account</th>
              <th className="pb-4 w-[18%] font-bold">Disbursement Date</th>
              <th className="pb-4 w-[15%] text-right font-bold">Value Sum ($)</th>
              <th className="pb-4 w-[12%] text-center font-bold">Status</th>
              <th className="pb-4 pr-2 w-[5%] text-right font-bold">VOID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE]">
            {filteredPayments.map((pay) => (
              <tr key={pay.id} id={`expense-row-${pay.id}`} className="hover:bg-[#F5F3F0]/30 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[#1A1A1A] text-xs">{pay.vendor}</span>
                    {pay.notes && (
                      <span className="text-gray-400 font-sans italic text-[10px] truncate max-w-[220px]" title={pay.notes}>
                        {pay.notes}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-none px-2 py-0.5 whitespace-nowrap ${getCategoryBadgeColor(pay.category)}`}>
                    {pay.category}
                  </span>
                </td>
                <td className="py-4 text-[#1A1A1A] font-mono">
                  {pay.date}
                </td>
                <td className="py-4 text-right font-mono font-bold text-[#1A1A1A] text-xs">
                  ${pay.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 text-center">
                  <div className="flex justify-center flex-row">
                    <select
                      id={`expense-status-select-${pay.id}`}
                      value={pay.status}
                      onChange={(e) => onUpdatePaymentStatus(pay.id, e.target.value as OutgoingPayment["status"])}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide border rounded-none focus:outline-hidden cursor-pointer text-center outline-none ${getStatusStyle(pay.status)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>
                </td>
                <td className="py-4 pr-2 text-right">
                  <button
                    id={`expense-delete-btn-${pay.id}`}
                    type="button"
                    onClick={() => onDeletePayment(pay.id)}
                    className="p-1 px-2 text-[#1A1A1A] hover:text-red-600 border border-transparent hover:border-red-600 rounded-none cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-wider"
                  >
                    Void
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400 italic font-serif">
                  No payment entries match this search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
