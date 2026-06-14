import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Invoice, OutgoingPayment } from "../types";

interface Props {
  invoices: Invoice[];
  payments: OutgoingPayment[];
}

export function DashboardStats({ invoices, payments }: Props) {
  // Calculations
  const totalInvoiced = invoices
    .filter((inv) => inv.status !== "Draft")
    .reduce((total, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const totalCost = subtotal + tax - inv.discount;
      return total + (totalCost > 0 ? totalCost : 0);
    }, 0);

  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((total, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const totalCost = subtotal + tax - inv.discount;
      return total + (totalCost > 0 ? totalCost : 0);
    }, 0);

  const totalOutgoing = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingReceivables = invoices
    .filter((inv) => inv.status === "Pending" || inv.status === "Overdue")
    .reduce((total, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const totalCost = subtotal + tax - inv.discount;
      return total + (totalCost > 0 ? totalCost : 0);
    }, 0);

  const netProfit = totalCollected - totalOutgoing;

  const pendingTotal = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((total, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const totalCost = subtotal + tax - inv.discount;
      return total + (totalCost > 0 ? totalCost : 0);
    }, 0);

  const draftTotal = invoices
    .filter((inv) => inv.status === "Draft")
    .reduce((total, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const totalCost = subtotal + tax - inv.discount;
      return total + (totalCost > 0 ? totalCost : 0);
    }, 0);

  const projectedIncome = pendingTotal + draftTotal;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" id="stats-container">
      {/* Total Invoiced (Sales Pipeline) */}
      <div id="stat-card-total-invoiced" className="bg-white border border-[#1A1A1A] p-6 flex flex-col justify-between rounded-xs">
        <div>
          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-2 block font-bold">Billed Pipeline</span>
          <div className="text-3xl font-serif font-light text-[#1A1A1A] tracking-tight">
            ${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <p className="text-xs italic opacity-70 mt-3 text-gray-600">
          From active client accounts (excl. drafts)
        </p>
      </div>

      {/* Projected Income (Pending + Drafts) */}
      <div id="stat-card-projected-income" className="bg-white border border-[#1A1A1A] p-6 flex flex-col justify-between rounded-xs">
        <div>
          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-2 block font-bold">Projected Income</span>
          <div className="text-3xl font-serif font-light text-slate-800 tracking-tight">
            ${projectedIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1 text-[11px] text-gray-600 border-t border-[#1A1A1A]/10 pt-2">
          <div className="flex justify-between">
            <span className="italic">Pending invoices:</span>
            <span className="font-mono font-bold">${pendingTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="italic">Draft estimates:</span>
            <span className="font-mono font-bold">${draftTotal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Total Revenue Collected */}
      <div id="stat-card-collected" className="bg-white border border-[#1A1A1A] p-6 flex flex-col justify-between rounded-xs">
        <div>
          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-2 block font-bold">Collected Revenue</span>
          <div className="text-3xl font-serif font-light text-emerald-800 tracking-tight">
            ${totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <p className="text-xs italic opacity-70 mt-3 text-gray-600">
          Settled payments in hand
        </p>
      </div>

      {/* Outgoing Payments Tracking */}
      <div id="stat-card-outgoing" className="bg-white border border-[#1A1A1A] p-6 flex flex-col justify-between rounded-xs">
        <div>
          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-2 block font-bold">Total Expenditures</span>
          <div className="text-3xl font-serif font-light text-amber-900 tracking-tight">
            ${totalOutgoing.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <p className="text-xs italic opacity-70 mt-3 text-gray-600">
          Disbursed ledger accounts
        </p>
      </div>

      {/* Cash Flow Net Profitability */}
      <div id="stat-card-receivables" className={`border p-6 flex flex-col justify-between rounded-xs transition-colors ${netProfit >= 0 ? "bg-[#F5F3F0] border-[#1A1A1A] text-[#1A1A1A]" : "bg-red-50/50 border-[#1A1A1A] text-red-950"}`}>
        <div>
          <span className="text-[10px] uppercase tracking-widest opacity-60 mb-2 block font-bold">Net Position</span>
          <div className="text-3xl font-serif font-light tracking-tight">
            ${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center text-xs opacity-85">
          <span className="italic">Outstanding receivables:</span>
          <span className="font-mono font-bold">
            ${outstandingReceivables.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
