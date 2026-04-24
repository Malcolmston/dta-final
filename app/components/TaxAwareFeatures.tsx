"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

type AccountType = "taxable" | "traditional" | "roth" | "401k";

interface Holding {
  symbol: string;
  shares: number;
  costBasis: number;
  currentValue: number;
}

interface Account {
  name: string;
  type: AccountType;
  holdings: Holding[];
}

export default function TaxAwareFeatures() {
  const { palette } = useColorPalette();
  const [expanded, setExpanded] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Example accounts - in a real app, this would come from user portfolio
  const accounts: Account[] = [
    {
      name: "Brokerage Account",
      type: "taxable",
      holdings: [
        { symbol: "AAPL", shares: 50, costBasis: 8000, currentValue: 12000 },
        { symbol: "MSFT", shares: 30, costBasis: 9000, currentValue: 11000 },
      ],
    },
    {
      name: "Traditional IRA",
      type: "traditional",
      holdings: [
        { symbol: "VTI", shares: 100, costBasis: 22000, currentValue: 25000 },
        { symbol: "BND", shares: 80, costBasis: 6000, currentValue: 5800 },
      ],
    },
    {
      name: "Roth IRA",
      type: "roth",
      holdings: [
        { symbol: "VXUS", shares: 50, costBasis: 2800, currentValue: 3000 },
        { symbol: "SCHD", shares: 40, costBasis: 3000, currentValue: 3500 },
      ],
    },
    {
      name: "401(k)",
      type: "401k",
      holdings: [
        { symbol: "FXAIX", shares: 200, costBasis: 30000, currentValue: 42000 },
        { symbol: "FXNAX", shares: 100, costBasis: 11000, currentValue: 10500 },
      ],
    },
  ];

  const getAccountTypeLabel = (type: AccountType): string => {
    switch (type) {
      case "taxable":
        return "Taxable Brokerage";
      case "traditional":
        return "Traditional IRA";
      case "roth":
        return "Roth IRA";
      case "401k":
        return "401(k)";
    }
  };

  const getAccountTypeInfo = (type: AccountType): { label: string; color: string; desc: string } => {
    switch (type) {
      case "taxable":
        return { label: "Taxable", color: "bg-red-100 text-red-800", desc: "Capital gains taxed when sold; dividends taxed annually" };
      case "traditional":
        return { label: "Tax-Deferred", color: "bg-blue-100 text-blue-800", desc: "Contributions may be tax-deductible; taxed on withdrawal" };
      case "roth":
        return { label: "Tax-Free", color: "bg-green-100 text-green-800", desc: "Contributions already taxed; withdrawals are tax-free" };
      case "401k":
        return { label: "Employer Plan", color: "bg-purple-100 text-purple-800", desc: "Pre-tax contributions; taxed on withdrawal" };
    }
  };

  // Calculate totals
  const totalValue = accounts.reduce((sum, acc) =>
    sum + acc.holdings.reduce((s, h) => s + h.currentValue, 0), 0
  );

  const taxableValue = accounts
    .filter(a => a.type === "taxable")
    .reduce((sum, acc) => sum + acc.holdings.reduce((s, h) => s + h.currentValue, 0), 0);

  const taxAdvantagedValue = accounts
    .filter(a => a.type !== "taxable")
    .reduce((sum, acc) => sum + acc.holdings.reduce((s, h) => s + h.currentValue, 0), 0);

  const taxableUnrealizedGain = accounts
    .filter(a => a.type === "taxable")
    .reduce((sum, acc) =>
      sum + acc.holdings.reduce((s, h) => s + (h.currentValue - h.costBasis), 0), 0
    );

  // Estimate tax impact (simplified)
  const estimatedTaxRate = 0.15; // 15% capital gains rate
  const potentialTaxLiability = taxableUnrealizedGain > 0 ? taxableUnrealizedGain * estimatedTaxRate : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Tax-Aware Features</h2>
      <p className="mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Different account types have different tax implications. Understanding this helps maximize after-tax returns.
      </p>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Total Portfolio</p>
          <p className="text-2xl font-bold" style={{ color: palette.text }}>${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.negative + "15", borderColor: palette.negative + "40" }}>
          <p className="text-sm" style={{ color: palette.negative }}>Taxable Accounts</p>
          <p className="text-2xl font-bold" style={{ color: palette.negative }}>${taxableValue.toLocaleString()}</p>
          <p className="text-xs" style={{ color: palette.negative, opacity: 0.7 }}>{((taxableValue / totalValue) * 100).toFixed(0)}% of portfolio</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.positive + "15", borderColor: palette.positive + "40" }}>
          <p className="text-sm" style={{ color: palette.positive }}>Tax-Advantaged</p>
          <p className="text-2xl font-bold" style={{ color: palette.positive }}>${taxAdvantagedValue.toLocaleString()}</p>
          <p className="text-xs" style={{ color: palette.positive, opacity: 0.7 }}>{((taxAdvantagedValue / totalValue) * 100).toFixed(0)}% of portfolio</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.accent + "15", borderColor: palette.accent + "40" }}>
          <p className="text-sm" style={{ color: palette.accent }}>Est. Tax Liability</p>
          <p className="text-2xl font-bold" style={{ color: palette.accent }}>${potentialTaxLiability.toLocaleString()}</p>
          <p className="text-xs" style={{ color: palette.accent, opacity: 0.7 }}>if gains realized</p>
        </div>
      </div>

      {/* Account Type Explanation */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
        <h3 className="font-semibold mb-3" style={{ color: palette.text }}>Account Type Comparison</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: palette.negative + "20", color: palette.negative }}>Taxable</span>
            <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>Capital gains and dividends are taxed annually or upon sale.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: palette.primary + "20", color: palette.primary }}>Traditional IRA</span>
            <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>Contributions may be deductible; withdrawals taxed as income.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: palette.positive + "20", color: palette.positive }}>Roth IRA</span>
            <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>Contributions already taxed; qualified withdrawals are tax-free.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: palette.secondary + "20", color: palette.secondary }}>401(k)</span>
            <p className="mt-2" style={{ color: palette.text, opacity: 0.7 }}>Pre-tax contributions; employer match; withdrawals taxed.</p>
          </div>
        </div>
      </div>

      {/* Expandable Account Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 bg-transparent rounded-lg hover:bg-gray-200 transition-colors"
      >
        <span className="font-medium palette.text">View Account Details</span>
        <svg
          className={`w-5 h-5 palette.text transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {accounts.map((account) => {
            const typeInfo = getAccountTypeInfo(account.type);
            const accountValue = account.holdings.reduce((sum, h) => sum + h.currentValue, 0);
            const accountCostBasis = account.holdings.reduce((sum, h) => sum + h.costBasis, 0);
            const unrealizedGain = accountValue - accountCostBasis;

            return (
              <div key={account.name} className="border border-transparent rounded-lg overflow-hidden">
                <div
                  className="p-4 bg-transparent cursor-pointer hover:bg-transparent"
                  onClick={() => setSelectedAccount(selectedAccount === account.name ? null : account.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <h4 className="font-medium palette.text">{account.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold palette.text">${accountValue.toLocaleString()}</p>
                      <p className={`text-xs ${unrealizedGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {unrealizedGain >= 0 ? "+" : ""}${unrealizedGain.toLocaleString()} unrealized
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAccount === account.name && (
                  <div className="p-4 bg-white border-t border-transparent">
                    <p className="text-sm palette.text mb-3">{typeInfo.desc}</p>
                    <table className="w-full text-sm">
                      <thead className="bg-transparent">
                        <tr>
                          <th className="px-3 py-2 text-left palette.text">Symbol</th>
                          <th className="px-3 py-2 text-right palette.text">Shares</th>
                          <th className="px-3 py-2 text-right palette.text">Cost Basis</th>
                          <th className="px-3 py-2 text-right palette.text">Current Value</th>
                          <th className="px-3 py-2 text-right palette.text">Gain/Loss</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.holdings.map((holding) => {
                          const gain = holding.currentValue - holding.costBasis;
                          return (
                            <tr key={holding.symbol} className="border-t border-transparent">
                              <td className="px-3 py-2 font-medium palette.text">{holding.symbol}</td>
                              <td className="px-3 py-2 text-right palette.text">{holding.shares}</td>
                              <td className="px-3 py-2 text-right palette.text">${holding.costBasis.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right palette.text">${holding.currentValue.toLocaleString()}</td>
                              <td className={`px-3 py-2 text-right ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {gain >= 0 ? "+" : ""}${gain.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tax-Loss Harvesting Section */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: palette.primary + "15", border: `1px solid ${palette.primary}30` }}>
        <h3 className="font-semibold mb-2" style={{ color: palette.primary }}>Tax-Loss Harvesting</h3>
        <p className="text-sm mb-3" style={{ color: palette.text, opacity: 0.8 }}>
          If you have losses in taxable accounts, you can sell losing positions to offset gains. This can reduce your tax bill while maintaining your asset allocation.
        </p>
        <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: palette.background }}>
          <p className="font-medium" style={{ color: palette.text }}>Key Points:</p>
          <ul className="list-disc list-inside mt-2 space-y-1" style={{ color: palette.text }}>
            <li>Can offset capital gains dollar-for-dollar</li>
            <li>Up to $3,000 of excess loss can offset ordinary income</li>
            <li>Must wait 30 days before repurchasing same/similar security (wash sale rule)</li>
            <li>Most effective in taxable accounts, not tax-advantaged accounts</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: palette.secondary + "15", border: `1px solid ${palette.secondary}30` }}>
        <p className="text-xs" style={{ color: palette.text }}>
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute tax advice. Consult a qualified tax professional for advice specific to your situation.
        </p>
      </div>
    </div>
  );
}