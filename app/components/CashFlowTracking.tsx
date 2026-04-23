"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

type CashFlowType = "contribution" | "withdrawal" | "dividend" | "interest" | "capital_gain";

interface CashFlow {
  id: string;
  date: string;
  type: CashFlowType;
  amount: number;
  description: string;
  account: string;
}

const TYPE_INFO: Record<CashFlowType, { label: string; color: string; icon: string }> = {
  contribution: { label: "Contribution", color: "bg-green-100 text-green-800", icon: "+" },
  withdrawal: { label: "Withdrawal", color: "bg-red-100 text-red-800", icon: "-" },
  dividend: { label: "Dividend", color: "bg-blue-100 text-blue-800", icon: "$" },
  interest: { label: "Interest", color: "bg-purple-100 text-purple-800", icon: "%" },
  capital_gain: { label: "Capital Gain", color: "bg-emerald-100 text-emerald-800", icon: "^" },
};

export default function CashFlowTracking() {
  const { palette } = useColorPalette();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("3mo");
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: "1", date: "2024-01-15", type: "contribution", amount: 1000, description: "Monthly 401(k) contribution", account: "401(k)" },
    { id: "2", date: "2024-01-20", type: "dividend", amount: 125.50, description: "VTI quarterly dividend", account: "Brokerage" },
    { id: "3", date: "2024-02-15", type: "contribution", amount: 1000, description: "Monthly 401(k) contribution", account: "401(k)" },
    { id: "4", date: "2024-02-15", type: "contribution", amount: 500, description: "Roth IRA contribution", account: "Roth IRA" },
    { id: "5", date: "2024-02-20", type: "dividend", amount: 89.75, description: "VXUS quarterly dividend", account: "Brokerage" },
    { id: "6", date: "2024-03-01", type: "withdrawal", amount: 2000, description: "Required minimum distribution", account: "Traditional IRA" },
    { id: "7", date: "2024-03-15", type: "contribution", amount: 1000, description: "Monthly 401(k) contribution", account: "401(k)" },
    { id: "8", date: "2024-03-20", type: "capital_gain", amount: 1500, description: "AAPL position sold", account: "Brokerage" },
    { id: "9", date: "2024-03-25", type: "interest", amount: 45.25, description: "Bond fund monthly income", account: "Brokerage" },
  ]);

  // Form state
  const [newFlow, setNewFlow] = useState<Partial<CashFlow>>({
    type: "contribution",
    amount: 0,
    description: "",
    account: "Brokerage",
  });

  const addCashFlow = () => {
    if (!newFlow.amount || !newFlow.description) return;

    const flow: CashFlow = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      type: newFlow.type as CashFlowType,
      amount: newFlow.amount,
      description: newFlow.description,
      account: newFlow.account || "Brokerage",
    };

    setCashFlows([flow, ...cashFlows]);
    setNewFlow({ type: "contribution", amount: 0, description: "", account: "Brokerage" });
    setShowAddForm(false);
  };

  // Calculate totals
  const totalInflows = cashFlows
    .filter((f) => f.type === "contribution" || f.type === "dividend" || f.type === "interest" || f.type === "capital_gain")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOutflows = cashFlows
    .filter((f) => f.type === "withdrawal")
    .reduce((sum, f) => sum + f.amount, 0);

  const netCashFlow = totalInflows - totalOutflows;

  // Group by type
  const byType = cashFlows.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = 0;
    acc[f.type] += f.amount;
    return acc;
  }, {} as Record<CashFlowType, number>);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Cash Flow Tracking</h2>
      <p className="mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Track income, contributions, withdrawals, and distributions to understand your portfolio's cash flow.
      </p>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.positive + "15", borderColor: palette.positive + "40" }}>
          <p className="text-sm" style={{ color: palette.positive }}>Total Inflows</p>
          <p className="text-2xl font-bold" style={{ color: palette.positive }}>${totalInflows.toLocaleString()}</p>
          <p className="text-xs" style={{ color: palette.positive, opacity: 0.7 }}>Contributions, dividends, interest, gains</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.negative + "15", borderColor: palette.negative + "40" }}>
          <p className="text-sm" style={{ color: palette.negative }}>Total Outflows</p>
          <p className="text-2xl font-bold" style={{ color: palette.negative }}>${totalOutflows.toLocaleString()}</p>
          <p className="text-xs" style={{ color: palette.negative, opacity: 0.7 }}>Withdrawals and distributions</p>
        </div>
        <div className="p-4 rounded-lg border" style={{
          backgroundColor: netCashFlow >= 0 ? palette.primary + "15" : palette.accent + "15",
          borderColor: netCashFlow >= 0 ? palette.primary + "40" : palette.accent + "40"
        }}>
          <p className="text-sm" style={{ color: netCashFlow >= 0 ? palette.primary : palette.accent }}>Net Cash Flow</p>
          <p className="text-2xl font-bold" style={{ color: netCashFlow >= 0 ? palette.primary : palette.accent }}>
            {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: netCashFlow >= 0 ? palette.primary : palette.accent, opacity: 0.7 }}>Inflows minus outflows</p>
        </div>
      </div>

      {/* Breakdown by Type */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Breakdown by Type</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {(Object.keys(TYPE_INFO) as CashFlowType[]).map((type) => {
            const info = TYPE_INFO[type];
            const amount = byType[type] || 0;
            return (
              <div key={type} className="p-3 rounded-lg text-center" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
                <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ color: palette.text }}>
                  {info.label}
                </span>
                <p className="mt-2 font-semibold" style={{ color: palette.text }}>${amount.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Cash Flow Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-4"
        style={{ backgroundColor: palette.primary, color: "#fff" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Cash Flow
      </button>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
          <h3 className="font-medium mb-3" style={{ color: palette.text }}>Add New Transaction</h3>
          <div className="grid md:grid-cols-5 gap-3">
            <select
              value={newFlow.type}
              onChange={(e) => setNewFlow({ ...newFlow, type: e.target.value as CashFlowType })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              {(Object.keys(TYPE_INFO) as CashFlowType[]).map((type) => (
                <option key={type} value={type}>{TYPE_INFO[type].label}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={newFlow.amount || ""}
              onChange={(e) => setNewFlow({ ...newFlow, amount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Description"
              value={newFlow.description || ""}
              onChange={(e) => setNewFlow({ ...newFlow, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={newFlow.account}
              onChange={(e) => setNewFlow({ ...newFlow, account: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Brokerage">Brokerage</option>
              <option value="Traditional IRA">Traditional IRA</option>
              <option value="Roth IRA">Roth IRA</option>
              <option value="401(k)">401(k)</option>
            </select>
            <button
              onClick={addCashFlow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Cash Flow Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-transparent">
            <tr>
              <th className="px-4 py-3 text-left palette.text font-medium">Date</th>
              <th className="px-4 py-3 text-left palette.text font-medium">Type</th>
              <th className="px-4 py-3 text-left palette.text font-medium">Description</th>
              <th className="px-4 py-3 text-left palette.text font-medium">Account</th>
              <th className="px-4 py-3 text-right palette.text font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashFlows.map((flow) => {
              const info = TYPE_INFO[flow.type];
              const isPositive = flow.type !== "withdrawal";
              return (
                <tr key={flow.id} className="border-t border-transparent">
                  <td className="px-4 py-3 palette.text">{flow.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${info.color}`}>
                      {info.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 palette.text">{flow.description}</td>
                  <td className="px-4 py-3 palette.text">{flow.account}</td>
                  <td className={`px-4 py-3 text-right font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : "-"}${flow.amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Income Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Portfolio Income Summary</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="palette.text">Dividend Income (Annualized)</p>
            <p className="text-lg font-bold text-blue-800">
              ${((byType.dividend || 0) * 4).toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">Based on quarterly rate</p>
          </div>
          <div>
            <p className="palette.text">Interest Income (Annualized)</p>
            <p className="text-lg font-bold text-blue-800">
              ${((byType.interest || 0) * 12).toLocaleString()}
            </p>
            <p className="text-xs text-blue-600">Based on monthly rate</p>
          </div>
        </div>
      </div>

      {/* Warning About Withdrawals */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Early withdrawals from tax-advantaged accounts (before age 59½) may incur penalties. Required Minimum Distributions (RMDs) from Traditional IRAs and 401(k)s begin at age 73.
        </p>
      </div>
    </div>
  );
}