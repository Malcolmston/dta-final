"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  desiredIncome: number;
}

export default function RetirementCalculator() {
  const { palette } = useColorPalette();

  const [inputs, setInputs] = useState<RetirementInputs>({
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 500,
    expectedReturn: 7,
    desiredIncome: 60000,
  });

  const calculateRetirement = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const months = yearsToRetirement * 12;
    const monthlyRate = inputs.expectedReturn / 100 / 12;
    const futureValueSavings = inputs.currentSavings * Math.pow(1 + monthlyRate, months);
    const futureValueContributions =
      inputs.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const totalAtRetirement = futureValueSavings + futureValueContributions;
    const annualIncome = totalAtRetirement * 0.04;

    return {
      totalAtRetirement,
      annualIncome,
      yearsToRetirement,
      monthlyFrom401k: Math.min(inputs.monthlyContribution * 1.5, 23000 / 12),
    };
  };

  const results = calculateRetirement();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (key: keyof RetirementInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
        <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Retirement Calculator
      </h3>

      <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
        Plan for retirement by estimating how much you need to save. Uses the 4% safe withdrawal rule.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Current Age</label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => handleInputChange("currentAge", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="18"
              max="80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Retirement Age</label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => handleInputChange("retirementAge", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="50"
              max="80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Current Savings ($)</label>
            <input
              type="number"
              value={inputs.currentSavings}
              onChange={(e) => handleInputChange("currentSavings", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Monthly Contribution ($)</label>
            <input
              type="number"
              value={inputs.monthlyContribution}
              onChange={(e) => handleInputChange("monthlyContribution", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="0"
              step="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Expected Annual Return (%)</label>
            <input
              type="number"
              value={inputs.expectedReturn}
              onChange={(e) => handleInputChange("expectedReturn", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="1"
              max="15"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: palette.text }}>Desired Annual Income ($)</label>
            <input
              type="number"
              value={inputs.desiredIncome}
              onChange={(e) => handleInputChange("desiredIncome", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
              min="20000"
              step="5000"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg p-4 border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
            <h4 className="font-semibold mb-3" style={{ color: palette.text }}>Projections</h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>At retirement ({inputs.retirementAge}):</span>
                <span className="font-bold text-lg" style={{ color: palette.primary }}>
                  {formatCurrency(results.totalAtRetirement)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>4% annual income:</span>
                <span className="font-semibold" style={{ color: palette.positive }}>
                  {formatCurrency(results.annualIncome)}/year
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>Years until retirement:</span>
                <span className="font-semibold" style={{ color: palette.text }}>
                  {results.yearsToRetirement} years
                </span>
              </div>

              <div className="border-t pt-3 mt-3" style={{ borderColor: palette.gridLines }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>401(k) equivalent:</span>
                  <span className="font-semibold" style={{ color: palette.text }}>
                    ~{formatCurrency(results.monthlyFrom401k)}/month
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: results.annualIncome >= inputs.desiredIncome ? palette.positive + "15" : palette.accent + "15",
              borderColor: results.annualIncome >= inputs.desiredIncome ? palette.positive : palette.accent
            }}
          >
            {results.annualIncome >= inputs.desiredIncome ? (
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5" style={{ color: palette.positive }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold" style={{ color: palette.positive }}>On Track!</p>
                  <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
                    Your projected retirement savings should meet your income goal.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5" style={{ color: palette.accent }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l.158 1.44a1.998 1.998 0 002.104.64l1.428-.803c.752-.424 1.684.11 1.423.967l-.51 1.767a1.999 1.999 0 01-.326 1.958l.957 1.417c.5.742.185 1.71-.573 1.757l-1.562.094c-.748.045-1.371.634-1.366 1.372v.135c0 2.456-1.99 4.457-4.471 4.457S3.008 15.438 3.008 12.982c0-.753.192-1.464.526-2.093l-.919-1.364c-.495-.735-.318-1.714.323-2.18l1.322-.962c.58-.422.743-1.256.379-1.926l-.752-1.386c-.377-.695.102-1.518.872-1.494l1.563.05c.758.024 1.365-.573 1.377-1.302V5.29c.006-.765-.527-1.414-1.298-1.33l-1.564.17z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold" style={{ color: palette.accent }}>Needs Attention</p>
                  <p className="text-sm" style={{ color: palette.text, opacity: 0.8 }}>
                    Consider increasing monthly contributions or adjusting your expected return.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t" style={{ borderColor: palette.gridLines }}>
        <p className="text-xs" style={{ color: palette.text, opacity: 0.6 }}>
          <strong>Note:</strong> This is a simplified projection. Actual returns will vary. Consult a financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
}