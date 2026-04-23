"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface FeeItem {
  category: string;
  type: string;
  cost: number;
  description: string;
}

interface PortfolioHolding {
  symbol: string;
  shares: number;
  costBasis: number;
  currentValue: number;
}

export default function FeeDisclosure() {
  const { palette } = useColorPalette();
  const [showDetails, setShowDetails] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  // Example holdings - in a real app, this would come from user portfolio
  const holdings: PortfolioHolding[] = [
    { symbol: "VTI", shares: 100, costBasis: 22000, currentValue: 25000 },
    { symbol: "VXUS", shares: 50, costBasis: 2800, currentValue: 3000 },
    { symbol: "BND", shares: 80, costBasis: 6000, currentValue: 5800 },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostBasis = holdings.reduce((sum, h) => sum + h.costBasis, 0);

  // Common fee structures
  const feeItems: FeeItem[] = [
    {
      category: "Expense Ratios (Annual)",
      type: "VTI (Total Stock Market)",
      cost: 0.03,
      description: "Vanguard's management fee for VTI",
    },
    {
      category: "Expense Ratios (Annual)",
      type: "VXUS (International)",
      cost: 0.07,
      description: "Vanguard's management fee for VXUS",
    },
    {
      category: "Expense Ratios (Annual)",
      type: "BND (Total Bond Market)",
      cost: 0.03,
      description: "Vanguard's management fee for BND",
    },
    {
      category: "Trading Costs",
      type: "Commission",
      cost: 0,
      description: "Most brokers now offer $0 commissions",
    },
    {
      category: "Trading Costs",
      type: "Bid-Ask Spread (Est.)",
      cost: 0.01,
      description: "Estimated cost per trade due to spread",
    },
    {
      category: "Advisory Fees",
      type: "Robo-Advisor",
      cost: 0.25,
      description: "Typical fee for automated advisory services",
    },
    {
      category: "Advisory Fees",
      type: "Human Advisor",
      cost: 1.0,
      description: "Typical fee for human financial advisor",
    },
  ];

  const calculateTotalFees = (advisoryFee: number = 0) => {
    const expenseRatios = feeItems
      .filter(f => f.category === "Expense Ratios (Annual)")
      .reduce((sum, f) => sum + f.cost, 0);

    const tradingCosts = feeItems
      .filter(f => f.category === "Trading Costs")
      .reduce((sum, f) => sum + f.cost, 0);

    return expenseRatios + tradingCosts + advisoryFee;
  };

  const totalFees = calculateTotalFees();
  const totalWithAdvisory = calculateTotalFees(0.5);

  // Calculate impact over time
  const calculateLongTermImpact = (initialInvestment: number, annualReturn: number, years: number, feePercent: number) => {
    const grossResult = initialInvestment * Math.pow(1 + annualReturn / 100, years);
    const netResult = initialInvestment * Math.pow(1 + (annualReturn - feePercent) / 100, years);
    return {
      gross: grossResult,
      net: netResult,
      lostToFees: grossResult - netResult,
    };
  };

  const longTermImpact = calculateLongTermImpact(totalValue, 7, 30, totalWithAdvisory);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 rounded-xl shadow-lg" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: palette.text }}>Fee Disclosure</h2>
      <p className="mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Understanding fees is critical to long-term investment success. Even small fees can significantly reduce your portfolio over time.
      </p>

      {/* Important Disclaimer */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.accent + "15", borderColor: palette.accent + "40" }}>
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: palette.accent }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l.178.829c.44 1.964 1.488 3.678 3.054 4.666a4.37 4.37 0 003.337 1.957c1.272 0 2.435-.535 3.266-1.412a4.34 4.34 0 001.107-3.13 4.32 4.32 0 00-1.107-3.129l-.827-.178c-1.12-.256-2.033-.787-2.663-1.54a4.326 4.326 0 00-1.234-.987 4.31 4.31 0 00-1.564-.362 4.352 4.352 0 00-1.564.362 4.326 4.326 0 00-1.234.987c-.63.753-1.543 1.284-2.663 1.54l-.827.178a4.32 4.32 0 00-1.107 3.129 4.32 4.32 0 001.107 3.13c.831.877 1.994 1.412 3.266 1.412a4.37 4.37 0 003.337-1.957c1.566-.988 2.614-2.702 3.054-4.666l.178-.829zM9 12a1 1 0 11-2 0 1 1 0 012 0zm-1 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium" style={{ color: palette.accent }}>Important Fee Information</p>
            <p className="text-sm mt-1" style={{ color: palette.text }}>
              Fees shown are estimates based on typical expense ratios and advisory structures. Actual fees vary by broker and advisor. This tool is for educational purposes only.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Portfolio Value</p>
          <p className="text-2xl font-bold" style={{ color: palette.text }}>${totalValue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Total Annual Fees (Estimated)</p>
          <p className="text-2xl font-bold" style={{ color: palette.negative }}>{totalFees.toFixed(2)}%</p>
          <p className="text-xs" style={{ color: palette.text, opacity: 0.5 }}>~${(totalValue * totalFees / 100).toFixed(0)}/year</p>
        </div>
        <div className="p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>With Advisory Services</p>
          <p className="text-2xl font-bold" style={{ color: palette.negative }}>{totalWithAdvisory.toFixed(2)}%</p>
          <p className="text-xs" style={{ color: palette.text, opacity: 0.5 }}>~${(totalValue * totalWithAdvisory / 100).toFixed(0)}/year</p>
        </div>
      </div>

      {/* Expandable Fee Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center justify-between w-full p-4 rounded-lg transition-colors"
        style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}
      >
        <span className="font-medium" style={{ color: palette.text }}>View Fee Breakdown</span>
        <svg
          className={`w-5 h-5 transition-transform ${showDetails ? "rotate-180" : ""}`}
          style={{ color: palette.text }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-transparent">
              <tr>
                <th className="px-4 py-2 text-left font-medium" style={{ color: palette.text }}>Category</th>
                <th className="px-4 py-2 text-left font-medium" style={{ color: palette.text }}>Type</th>
                <th className="px-4 py-2 text-right font-medium" style={{ color: palette.text }}>Cost</th>
                <th className="px-4 py-2 text-left font-medium" style={{ color: palette.text }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((fee, idx) => (
                <tr key={idx} className="border-t border-transparent">
                  <td className="px-4 py-2" style={{ color: palette.text }}>{fee.category}</td>
                  <td className="px-4 py-2" style={{ color: palette.text, opacity: 0.7 }}>{fee.type}</td>
                  <td className="px-4 py-2 text-right" style={{ color: palette.text }}>{fee.cost.toFixed(2)}%</td>
                  <td className="px-4 py-2" style={{ color: palette.text, opacity: 0.6 }}>{fee.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Impact Calculator Toggle */}
      <button
        onClick={() => setShowCalculator(!showCalculator)}
        className="mt-4 flex items-center justify-between w-full p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <span className="font-medium text-blue-800">See How Fees Impact Long-Term Growth</span>
        <svg
          className={`w-5 h-5 text-blue-600 transition-transform ${showCalculator ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showCalculator && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-4">
            This example shows how much your {totalValue.toLocaleString()} portfolio could grow over 30 years with a 7% annual return, accounting for fees:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm palette.text">Without Fees (Gross)</p>
              <p className="text-lg font-bold text-green-600">${longTermImpact.gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm palette.text">With {totalWithAdvisory.toFixed(2)}% Fees (Net)</p>
              <p className="text-lg font-bold text-blue-600">${longTermImpact.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm palette.text">Lost to Fees</p>
              <p className="text-lg font-bold text-red-600">${longTermImpact.lostToFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <p className="text-xs palette.text mt-4">
            * This is a hypothetical example for educational purposes. Actual returns will vary. The example assumes constant 7% annual return and constant fees.
          </p>
        </div>
      )}

      {/* Fee Comparison Reference */}
      <div className="mt-6 p-4 bg-transparent rounded-lg">
        <h3 className="font-semibold palette.text mb-3">Fee Comparison Reference</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium palette.text">Low-Cost Index Funds</p>
            <p className="palette.text">0.03% - 0.15% annual expense ratio</p>
          </div>
          <div>
            <p className="font-medium palette.text">Robo-Advisors</p>
            <p className="palette.text">0.25% - 0.50% annual advisory fee</p>
          </div>
          <div>
            <p className="font-medium palette.text">Traditional Advisors</p>
            <p className="palette.text">0.75% - 1.50% annual advisory fee</p>
          </div>
          <div>
            <p className="font-medium palette.text">Actively Managed Funds</p>
            <p className="palette.text">0.50% - 2.00%+ annual expense ratio</p>
          </div>
        </div>
      </div>
    </div>
  );
}