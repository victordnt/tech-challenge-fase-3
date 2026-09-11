import type { MockTransaction } from "@/components/transaction-group-card";

export const todayTransactions: MockTransaction[] = [
  {
    id: "1",
    description: "Whole Foods Market",
    category: "Groceries",
    time: "09:42 AM",
    amount: "$142.50",
    type: "expense",
  },
  {
    id: "2",
    description: "Blue Bottle Coffee",
    category: "Food & Drink",
    time: "08:15 AM",
    amount: "$6.50",
    type: "expense",
  },
  {
    id: "3",
    description: "Tech Corp Inc.",
    category: "Salary",
    time: "03:00 PM",
    amount: "$4,250.00",
    type: "income",
  },
];

export const yesterdayTransactions: MockTransaction[] = [
  {
    id: "4",
    description: "Uber Ride",
    category: "Transport",
    time: "06:20 PM",
    amount: "$24.80",
    type: "expense",
  },
  {
    id: "5",
    description: "Netflix",
    category: "Entertainment",
    time: "10:00 AM",
    amount: "$15.99",
    type: "expense",
  },
];
