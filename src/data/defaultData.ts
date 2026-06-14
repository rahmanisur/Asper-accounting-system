import { Invoice, OutgoingPayment } from "../types";

export const defaultInvoices: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-20481",
    clientName: "Jane Doe",
    clientEmail: "jane.doe@acme.corp",
    clientCompany: "Acme Corporation",
    issueDate: "2026-06-01",
    dueDate: "2026-07-01",
    items: [
      { id: "item_1_1", description: "UI Design & UX Prototyping (Figma)", quantity: 24, unitPrice: 125 },
      { id: "item_1_2", description: "Frontend Development (React, Tailwind CSS)", quantity: 45, unitPrice: 110 }
    ],
    taxRate: 8,
    discount: 200,
    status: "Paid",
    notes: "Thank you for partnering with us for your design. Net 30 terms apply."
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-20482",
    clientName: "Tony Stark",
    clientEmail: "tony@starkindustries.com",
    clientCompany: "Stark Industries",
    issueDate: "2026-06-05",
    dueDate: "2026-07-05",
    items: [
      { id: "item_2_1", description: "Arc Reactor Simulation software consult", quantity: 12, unitPrice: 350 },
      { id: "item_2_2", description: "Custom UI dashboard for reactor monitoring", quantity: 1, unitPrice: 5000 }
    ],
    taxRate: 5,
    discount: 0,
    status: "Pending",
    notes: "Special R&D consultancy rates. Wire transfer details on standard portal."
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-20483",
    clientName: "Bruce Wayne",
    clientEmail: "bruce@waynecorp.com",
    clientCompany: "Wayne Enterprises",
    issueDate: "2026-05-10",
    dueDate: "2026-06-10",
    items: [
      { id: "item_3_1", description: "Advanced Satellite Telemetry auditing", quantity: 40, unitPrice: 200 }
    ],
    taxRate: 10,
    discount: 500,
    status: "Overdue",
    notes: "Urgent Batman suite feedback session scheduled."
  },
  {
    id: "inv_4",
    invoiceNumber: "INV-20484",
    clientName: "Norman Osborn",
    clientEmail: "norman@oscorp.tech",
    clientCompany: "Oscorp Tech",
    issueDate: "2026-06-12",
    dueDate: "2026-07-12",
    items: [
      { id: "item_4_1", description: "Glider stabilizing gyro-formula updates", quantity: 8, unitPrice: 180 }
    ],
    taxRate: 0,
    discount: 0,
    status: "Draft",
    notes: "Draft invoice for pending authorization. Review pricing matrix."
  }
];

export const defaultPayments: OutgoingPayment[] = [
  {
    id: "pay_1",
    vendor: "Amazon Web Services",
    category: "Hosting & Infrastructure",
    amount: 642.50,
    date: "2026-06-12",
    status: "Paid",
    notes: "Monthly production cluster nodes & database backing."
  },
  {
    id: "pay_2",
    vendor: "Figma Inc",
    category: "Software Subscriptions",
    amount: 144.00,
    date: "2026-06-10",
    status: "Paid",
    notes: "Enterprise Figma editor seats renewal."
  },
  {
    id: "pay_3",
    vendor: "Sarah Lin (Contractor)",
    category: "Contractors & Freelancers",
    amount: 3200.00,
    date: "2026-06-25",
    status: "Pending",
    notes: "React Developer retainer payment - Mile 2 delivery feedback."
  },
  {
    id: "pay_4",
    vendor: "Google Cloud",
    category: "Hosting & Infrastructure",
    amount: 85.20,
    date: "2026-06-08",
    status: "Paid",
    notes: "Firebase databases, cloud run instances & domain registries."
  },
  {
    id: "pay_5",
    vendor: "WeWork Boston",
    category: "Rent & Office Space",
    amount: 1500.00,
    date: "2026-07-01",
    status: "Scheduled",
    notes: "Hotdesks renewal fee."
  }
];
