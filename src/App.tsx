import React, { useState, useEffect } from "react";
import { Sparkles, DollarSign, Receipt, CreditCard, Layers, TrendingUp, Calendar, User, FileText, Download, RotateCcw } from "lucide-react";
import { Invoice, OutgoingPayment } from "./types";
import { defaultInvoices, defaultPayments } from "./data/defaultData";
import { DashboardStats } from "./components/DashboardStats";
import { AISmartCreator } from "./components/AISmartCreator";
import { InvoiceList } from "./components/InvoiceList";
import { ExpenseList } from "./components/ExpenseList";
import { InvoiceDetailsModal } from "./components/InvoiceDetailsModal";

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<OutgoingPayment[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "outgoing">("overview");
  const [showForecast, setShowForecast] = useState(false);

  // Load from local storage or default data
  useEffect(() => {
    const cachedInvoices = localStorage.getItem("small_biz_invoices");
    const cachedPayments = localStorage.getItem("small_biz_payments");

    if (cachedInvoices) {
      setInvoices(JSON.parse(cachedInvoices));
    } else {
      setInvoices(defaultInvoices);
      localStorage.setItem("small_biz_invoices", JSON.stringify(defaultInvoices));
    }

    if (cachedPayments) {
      setPayments(JSON.parse(cachedPayments));
    } else {
      setPayments(defaultPayments);
      localStorage.setItem("small_biz_payments", JSON.stringify(defaultPayments));
    }
  }, []);

  // Sync to local storage
  const saveInvoicesToStore = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem("small_biz_invoices", JSON.stringify(newInvoices));
  };

  const savePaymentsToStore = (newPayments: OutgoingPayment[]) => {
    setPayments(newPayments);
    localStorage.setItem("small_biz_payments", JSON.stringify(newPayments));
  };

  // Add utilities
  const handleAddInvoice = (newInv: Omit<Invoice, "id">) => {
    const created: Invoice = {
      ...newInv,
      id: `inv_${Date.now()}`
    };
    saveInvoicesToStore([created, ...invoices]);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice record? This is irreversible.")) {
      const filtered = invoices.filter((item) => item.id !== id);
      saveInvoicesToStore(filtered);
    }
  };

  const handleUpdateStatus = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map((inv) => {
      if (inv.id === id) {
        return { ...inv, status };
      }
      return inv;
    });
    saveInvoicesToStore(updated);
  };

  const handleAddPayment = (newPay: Omit<OutgoingPayment, "id">) => {
    const created: OutgoingPayment = {
      ...newPay,
      id: `pay_${Date.now()}`
    };
    savePaymentsToStore([created, ...payments]);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      const filtered = payments.filter((item) => item.id !== id);
      savePaymentsToStore(filtered);
    }
  };

  const handleUpdatePaymentStatus = (id: string, status: OutgoingPayment["status"]) => {
    const updated = payments.map((p) => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    });
    savePaymentsToStore(updated);
  };

  const handleExportCSV = () => {
    const headers = ["Month", "Year-Month", "Billed Income (USD)", "Spent Expenditures (USD)", "Net Cash Flow (USD)"];
    
    const rows = monthlyFlows.map((m) => {
      const netCashFlow = m.income - m.outgoing;
      return [
        m.name,
        m.match,
        m.income.toFixed(2),
        m.outgoing.toFixed(2),
        netCashFlow.toFixed(2)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly_ledger_export_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom cashflow SVG timeline processing
  // Calculates income vs outgoings by month for 2026-01-XX to 2026-06-XX
  const processMonthlyFlows = () => {
    const months = [
      { name: "Jan", match: "2026-01", income: 0, outgoing: 0, isForecast: false },
      { name: "Feb", match: "2026-02", income: 0, outgoing: 0, isForecast: false },
      { name: "Mar", match: "2026-03", income: 0, outgoing: 0, isForecast: false },
      { name: "Apr", match: "2026-04", income: 0, outgoing: 0, isForecast: false },
      { name: "May", match: "2026-05", income: 0, outgoing: 0, isForecast: false },
      { name: "Jun", match: "2026-06", income: 0, outgoing: 0, isForecast: false },
    ];

    // Summarize Income
    invoices.forEach((inv) => {
      if (inv.status !== "Draft") {
        const dateStr = inv.issueDate; // e.g. "2026-06-01"
        const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const tax = subtotal * (inv.taxRate / 100);
        const totalCost = subtotal + tax - inv.discount;
        const total = totalCost > 0 ? totalCost : 0;

        const foundMonth = months.find((m) => dateStr.startsWith(m.match));
        if (foundMonth) {
          foundMonth.income += total;
        }
      }
    });

    // Summarize Outgoing
    payments.forEach((pay) => {
      const dateStr = pay.date;
      const amount = pay.amount;

      const foundMonth = months.find((m) => dateStr.startsWith(m.match));
      if (foundMonth) {
        foundMonth.outgoing += amount;
      }
    });

    if (!showForecast) {
      return months;
    }

    // Extrapolate Jul, Aug, Sep based on Pending or Draft Invoices & Payments
    const totalHistIncome = months.reduce((sum, m) => sum + m.income, 0);
    const totalHistOutgoing = months.reduce((sum, m) => sum + m.outgoing, 0);
    const avgHistIncome = totalHistIncome / 6;
    const avgHistOutgoing = totalHistOutgoing / 6;

    const getInvoiceValue = (inv: Invoice) => {
      const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * (inv.taxRate / 100);
      const total = subtotal + tax - inv.discount;
      return total > 0 ? total : 0;
    };

    // Income projections (Pending and Drafts mapped to their due months or distributed)
    const pendingInvoices = invoices.filter((inv) => inv.status === "Pending" || inv.status === "Overdue");
    const draftInvoices = invoices.filter((inv) => inv.status === "Draft");

    const getMonthlyPendingTotal = (monthMatch: string, overdueInFirstMonth: boolean = false) => {
      return pendingInvoices
        .filter((inv) => {
          const due = inv.dueDate || "2026-07-01";
          if (overdueInFirstMonth && due < "2026-07-01") {
            return true; // Catch overdue or past due invoices in Jul
          }
          return due.startsWith(monthMatch);
        })
        .reduce((sum, inv) => sum + getInvoiceValue(inv), 0);
    };

    const getMonthlyDraftTotal = (monthMatch: string) => {
      return draftInvoices
        .filter((inv) => {
          const due = inv.dueDate || "2026-07-01";
          return due.startsWith(monthMatch);
        })
        .reduce((sum, inv) => sum + getInvoiceValue(inv), 0);
    };

    // July: due in July or overdue in past
    const julPendingInc = getMonthlyPendingTotal("2026-07", true);
    const julDraftInc = getMonthlyDraftTotal("2026-07");

    // August: due in August
    const augPendingInc = getMonthlyPendingTotal("2026-08");
    const augDraftInc = getMonthlyDraftTotal("2026-08");

    // September: due in September
    const sepPendingInc = getMonthlyPendingTotal("2026-09");
    const sepDraftInc = getMonthlyDraftTotal("2026-09");

    // Expense Projections (Pending or Scheduled payments)
    const pendingPayments = payments.filter((pay) => pay.status === "Pending" || pay.status === "Scheduled");

    const getMonthlyPaymentsTotal = (monthMatch: string, overdueInFirstMonth: boolean = false) => {
      return pendingPayments
        .filter((pay) => {
          const dateStr = pay.date || "2026-07-01";
          if (overdueInFirstMonth && dateStr < "2026-07-01") {
            return true;
          }
          return dateStr.startsWith(monthMatch);
        })
        .reduce((sum, pay) => sum + pay.amount, 0);
    };

    const julExp = getMonthlyPaymentsTotal("2026-07", true);
    const augExp = getMonthlyPaymentsTotal("2026-08");
    const sepExp = getMonthlyPaymentsTotal("2026-09");

    // Recur baseline to keep projection realistic even if zero pending
    const julForecast = {
      name: "Jul",
      match: "2026-07",
      income: (avgHistIncome * 0.7) + julPendingInc + (julDraftInc * 0.5),
      outgoing: (avgHistOutgoing * 0.75) + julExp,
      isForecast: true,
    };

    const augForecast = {
      name: "Aug",
      match: "2026-08",
      income: (avgHistIncome * 0.75) + augPendingInc + (augDraftInc * 0.5),
      outgoing: (avgHistOutgoing * 0.75) + augExp,
      isForecast: true,
    };

    const sepForecast = {
      name: "Sep",
      match: "2026-09",
      income: (avgHistIncome * 0.8) + sepPendingInc + (sepDraftInc * 0.5),
      outgoing: (avgHistOutgoing * 0.75) + sepExp,
      isForecast: true,
    };

    return [...months, julForecast, augForecast, sepForecast];
  };

  const monthlyFlows = processMonthlyFlows();
  const maxFlowValue = Math.max(...monthlyFlows.flatMap((m) => [m.income, m.outgoing]), 1000);

  // Compute cumulative cash flows to construct potential cash position trendlines
  const processCumulativeFlows = () => {
    let currentBalance = 0;
    return monthlyFlows.map((m) => {
      currentBalance += (m.income - m.outgoing);
      return {
        ...m,
        cumulativePosition: currentBalance,
      };
    });
  };

  const cumulativeFlows = processCumulativeFlows();
  const maxCumulative = Math.max(...cumulativeFlows.map((f) => Math.abs(f.cumulativePosition)), 1000);

  const getCumulativeY = (val: number) => {
    const graphMaxHeight = 135; // height allocated for line (fits beautifully inside Y: 25 to 165)
    // Scale val/maxCumulative and cap it so that cumulative line fits inside the grid (min Y is 25, max Y is 165)
    const ratio = Math.min(Math.max(val / maxCumulative, -0.1), 1.0);
    return 165 - (ratio * graphMaxHeight);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased pb-16" id="app-root">
      
      {/* Editorial Header Bar */}
      <header className="bg-[#FDFCFB] border-b border-[#1A1A1A] sticky top-0 z-40" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-[10px] tracking-[0.25em] font-bold uppercase mb-1.5 text-gray-500">
              Aspect Accounting System
            </h1>
            <div className="text-3xl sm:text-4xl font-serif italic font-light tracking-tight text-[#1A1A1A]">
              Quarterly Ledger.
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/60 hidden md:inline">
              simonanisur@gmail.com
            </span>
            <span className="bg-[#1A1A1A] text-[#FDFCFB] px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Active Session
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-8">
        
        {/* Navigation Tabs */}
        <div className="flex bg-[#F5F3F0] p-1 border border-[#1A1A1A] rounded-none w-max self-center sm:self-start" id="view-tabs">
          <button
            id="nav-tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "overview" ? "bg-[#1A1A1A] text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            <Layers size={13} />
            Overview & Copilot
          </button>
          <button
            id="nav-tab-invoices"
            onClick={() => setActiveTab("invoices")}
            className={`px-5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "invoices" ? "bg-[#1A1A1A] text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            <Receipt size={13} />
            Invoices Ledger
          </button>
          <button
            id="nav-tab-outgoing"
            onClick={() => setActiveTab("outgoing")}
            className={`px-5 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "outgoing" ? "bg-[#1A1A1A] text-white" : "text-gray-600 hover:text-black"
            }`}
          >
            <CreditCard size={13} />
            Outgoing Expenses
          </button>
        </div>

        {/* Dynamic statistical dashboard */}
        <DashboardStats invoices={invoices} payments={payments} />

        {/* Tab view components */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="overview-view-grid">
            
            {/* AI Generator Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <AISmartCreator onAddInvoice={handleAddInvoice} />
              
              {/* Invoices segment shortcut */}
              <InvoiceList
                invoices={invoices.slice(0, 3)}
                onSelectInvoice={setSelectedInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onUpdateStatus={handleUpdateStatus}
                onAddInvoice={handleAddInvoice}
              />
            </div>

            {/* Metrics and cash chart column */}
            <div className="lg:col-span-4 flex flex-col gap-8" id="overview-sidebar">
              
              {/* Beautiful interactive SVG cashflow chart */}
              <div id="cashflow-visualizer" className="bg-white border border-[#1A1A1A] rounded-none p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-serif italic text-slate-900 flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[#1A1A1A]" />
                      Cash Flow Balance Sheet
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Automated visual matching of monthly billed vs active expensed ledger columns.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="forecast-toggle-btn"
                      onClick={() => setShowForecast(!showForecast)}
                      className={`px-2.5 py-1.5 border border-[#1A1A1A] rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                        showForecast
                          ? "bg-[#1A1A1A] text-white"
                          : "bg-transparent text-gray-650 hover:text-black border-dashed"
                      }`}
                    >
                      <Sparkles size={11} />
                      {showForecast ? "Forecast Active" : "Show Forecast"}
                    </button>
                    <button
                      id="export-csv-btn"
                      onClick={handleExportCSV}
                      title="Export Ledger to CSV"
                      className="px-2.5 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#FDFCFB] hover:text-[#1A1A1A] border border-[#1A1A1A] rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Download size={11} />
                      Export
                    </button>
                    <button
                      id="reset-chart-btn"
                      onClick={() => setShowForecast(false)}
                      title="Reset Chart View"
                      className="px-2.5 py-1.5 bg-[#F5F3F0] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] rounded-none text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="bg-[#F5F3F0]/60 border border-[#1A1A1A] rounded-none p-4 flex flex-col items-center justify-center">
                  {/* SVG Bar Chart container */}
                  <svg viewBox="0 0 320 220" className="w-full h-auto" id="svg-cashflow-chart">
                    {/* Y-axis guidelines */}
                    <line x1="30" y1="20" x2="310" y2="20" stroke="#E5E4E2" strokeWidth="1" />
                    <line x1="30" y1="70" x2="310" y2="70" stroke="#E5E4E2" strokeWidth="1" />
                    <line x1="30" y1="120" x2="310" y2="120" stroke="#E5E4E2" strokeWidth="1" />
                    <line x1="30" y1="170" x2="310" y2="170" stroke="#E5E4E2" strokeWidth="1" />
                    
                    {/* Base line */}
                    <line x1="30" y1="170" x2="310" y2="170" stroke="#1A1A1A" strokeWidth="1.5" />

                    {/* Chart Bars */}
                    {monthlyFlows.map((m, idx) => {
                      const spacing = showForecast ? 29 : 44;
                      const colWidth = showForecast ? 9 : 13;
                      const colGap = showForecast ? 10 : 15;
                      const startX = showForecast ? (30 + idx * spacing) : (35 + idx * spacing);
                      const graphMaxHeight = 145;

                      const incHeight = (m.income / maxFlowValue) * graphMaxHeight;
                      const outHeight = (m.outgoing / maxFlowValue) * graphMaxHeight;

                      const incY = 170 - incHeight;
                      const outY = 170 - outHeight;

                      return (
                        <g key={m.name} id={`bar-group-${m.name.toLowerCase()}`}>
                          {/* Income Bar */}
                          <rect
                            x={startX}
                            y={incY}
                            width={colWidth}
                            height={Math.max(incHeight, 2)}
                            fill={m.isForecast ? "none" : "#1A1A1A"}
                            stroke="#1A1A1A"
                            strokeWidth={m.isForecast ? 1 : 0}
                            strokeDasharray={m.isForecast ? "2 2" : undefined}
                            className={`transition-all duration-250 ${m.isForecast ? "opacity-60" : "hover:opacity-80"}`}
                          />
                          {/* Outgoing Bar */}
                          <rect
                            x={startX + colGap}
                            y={outY}
                            width={colWidth}
                            height={Math.max(outHeight, 2)}
                            fill={m.isForecast ? "none" : "#B4A297"}
                            stroke="#B4A297"
                            strokeWidth={m.isForecast ? 1 : 0}
                            strokeDasharray={m.isForecast ? "2 2" : undefined}
                            className={`transition-all duration-250 ${m.isForecast ? "opacity-60" : "hover:opacity-80"}`}
                          />

                          {/* X-axis Month names */}
                          <text
                            x={startX + (colGap / 2) + (colWidth / 2)}
                            y="188"
                            textAnchor="middle"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            fill="#1A1A1A"
                          >
                            {m.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Cumulative Potential Cash Position Overlays */}
                    {(() => {
                      const histPoints = cumulativeFlows
                        .slice(0, 6)
                        .map((f, i) => {
                          const spacing = showForecast ? 29 : 44;
                          const colWidth = showForecast ? 9 : 13;
                          const colGap = showForecast ? 10 : 15;
                          const startX = showForecast ? (30 + i * spacing) : (35 + i * spacing);
                          const x = startX + (colGap / 2) + (colWidth / 2);
                          const y = getCumulativeY(f.cumulativePosition);
                          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ");

                      const forePoints = showForecast
                        ? cumulativeFlows
                            .slice(5, 9)
                            .map((f, i) => {
                              const actualIdx = 5 + i;
                              const spacing = 29;
                              const colWidth = 9;
                              const colGap = 10;
                              const startX = 30 + actualIdx * spacing;
                              const x = startX + (colGap / 2) + (colWidth / 2);
                              const y = getCumulativeY(f.cumulativePosition);
                              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                            })
                            .join(" ")
                        : "";

                      return (
                        <g id="cumulative-overlay">
                          {/* Historical trendline */}
                          {histPoints && (
                            <path
                              d={histPoints}
                              fill="none"
                              stroke="#991C1C"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                          {/* Forecast trendline */}
                          {showForecast && forePoints && (
                            <path
                              d={forePoints}
                              fill="none"
                              stroke="#991C1C"
                              strokeWidth="2"
                              strokeDasharray="3 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Vertex Dots */}
                          {cumulativeFlows.map((f, i) => {
                            const spacing = showForecast ? 29 : 44;
                            const colWidth = showForecast ? 9 : 13;
                            const colGap = showForecast ? 10 : 15;
                            const startX = showForecast ? (30 + i * spacing) : (35 + i * spacing);
                            const x = startX + (colGap / 2) + (colWidth / 2);
                            const y = getCumulativeY(f.cumulativePosition);

                            return (
                              <g key={`cum-dot-${f.name}`} className="cursor-pointer">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="2.5"
                                  fill={f.isForecast ? "#FFFFFF" : "#991C1C"}
                                  stroke="#991C1C"
                                  strokeWidth="1.5"
                                />
                                <title>
                                  {`${f.name}${f.isForecast ? " (Forecast)" : ""}: Cash Position $${f.cumulativePosition.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                                </title>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}

                    {/* Map values */}
                    <text x="5" y="23" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#1A1A1A">Line Max</text>
                    <text x="5" y="173" fontSize="8" fontWeight="bold" fontFamily="monospace" fill="#1A1A1A">$0</text>
                  </svg>

                  {/* Chart Legend */}
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-3 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#1A1A1A] border border-[#1A1A1A]"></span>
                      <span>Billed Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#B4A297] border border-[#1A1A1A]"></span>
                      <span>Spent Ledger</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-[#991C1C] inline-block"></span>
                      <span>Cash Balance Curve</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#1A1A1A]/10 pt-3 flex flex-col gap-1 text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Periodic Audit Comment:</span>
                  <span className="text-gray-650 leading-relaxed italic">
                    Comparing historical 2026 logs. Billed consults peaked in June, with software & subcontractors driving outgoings.
                  </span>
                </div>
              </div>

              {/* Copilot Guidelines block */}
              <div className="bg-[#F5F3F0] border border-[#1A1A1A] rounded-none p-6 flex flex-col gap-4">
                <span className="text-[9px] bg-[#1A1A1A] text-white font-bold px-2 py-0.5 rounded-none w-max uppercase tracking-widest">
                  Copilot guidelines
                </span>
                <p className="text-xs text-gray-700 leading-relaxed font-serif italic">
                  "Try typing prompts like 'Invoice Simons App for 12 hours dev consultant fees nested with 8% federal tax'. The agent translates grammar into clean ledger balance rows instantly."
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#1A1A1A] font-bold">
                  <span>SYSTEM CALENDAR TIME: 2026-06-14</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="flex flex-col gap-6" id="invoices-full-tab">
            <InvoiceList
              invoices={invoices}
              onSelectInvoice={setSelectedInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onUpdateStatus={handleUpdateStatus}
              onAddInvoice={handleAddInvoice}
            />
          </div>
        )}

        {activeTab === "outgoing" && (
          <div className="flex flex-col gap-6" id="outgoing-full-tab">
            <ExpenseList
              payments={payments}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />
          </div>
        )}

      </main>

      {/* Invoice receipt PDF rendering Overlay Modal */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

    </div>
  );
}
