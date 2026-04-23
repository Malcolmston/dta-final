"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: "house" | "college" | "retirement" | "emergency" | "other";
}

export default function GoalTracking() {
  const { palette } = useColorPalette();

  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: "1",
      name: "House Down Payment",
      targetAmount: 50000,
      currentAmount: 25000,
      targetDate: "2027-06-01",
      category: "house",
    },
    {
      id: "2",
      name: "Emergency Fund",
      targetAmount: 15000,
      currentAmount: 12000,
      targetDate: "2025-12-31",
      category: "emergency",
    },
    {
      id: "3",
      name: "Kid's College Fund",
      targetAmount: 100000,
      currentAmount: 15000,
      targetDate: "2035-09-01",
      category: "college",
    },
  ]);

  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: "",
    category: "other",
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const calculateProgress = (goal: FinancialGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const calculateMonthsRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(months, 0);
  };

  const calculateMonthlyNeeded = (goal: FinancialGoal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const months = calculateMonthsRemaining(goal.targetDate);
    if (months <= 0) return remaining;
    return remaining / months;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "house":
        return palette.primary;
      case "college":
        return palette.secondary;
      case "retirement":
        return palette.positive;
      case "emergency":
        return palette.negative;
      default:
        return palette.accent;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "house":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "college":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "retirement":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "emergency":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
    }
  };

  return (
    <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: palette.text }}>
          <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Financial Goals
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm px-3 py-1 rounded-lg border transition-colors"
          style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
        >
          {showAddForm ? "Cancel" : "+ Add Goal"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
          <h4 className="font-semibold mb-3" style={{ color: palette.text }}>Add New Goal</h4>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Goal name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              className="col-span-2 px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            />
            <input
              type="number"
              placeholder="Target amount"
              value={newGoal.targetAmount || ""}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            />
            <input
              type="number"
              placeholder="Current amount"
              value={newGoal.currentAmount || ""}
              onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            />
            <input
              type="date"
              value={newGoal.targetDate}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            />
            <select
              value={newGoal.category}
              onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as FinancialGoal["category"] })}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: palette.gridLines, backgroundColor: palette.background, color: palette.text }}
            >
              <option value="house">House</option>
              <option value="college">College</option>
              <option value="retirement">Retirement</option>
              <option value="emergency">Emergency Fund</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            onClick={() => {
              if (newGoal.name && newGoal.targetAmount && newGoal.targetDate) {
                const goal: FinancialGoal = {
                  id: Date.now().toString(),
                  name: newGoal.name,
                  targetAmount: newGoal.targetAmount,
                  currentAmount: newGoal.currentAmount || 0,
                  targetDate: newGoal.targetDate,
                  category: newGoal.category || "other",
                };
                setGoals([...goals, goal]);
                setNewGoal({ name: "", targetAmount: 0, currentAmount: 0, targetDate: "", category: "other" });
                setShowAddForm(false);
              }
            }}
          >
            Save Goal
          </button>
        </div>
      )}

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
          const monthlyNeeded = calculateMonthlyNeeded(goal);
          const categoryColor = getCategoryColor(goal.category);

          return (
            <div key={goal.id} className="p-4 rounded-lg border" style={{ borderColor: palette.gridLines, backgroundColor: palette.background }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: categoryColor + "20", color: categoryColor }}
                  >
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: palette.text }}>{goal.name}</h4>
                    <p className="text-xs" style={{ color: palette.text, opacity: 0.6 }}>Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ backgroundColor: palette.gridLines, color: palette.text }}>
                  {goal.category}
                </span>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray">{formatCurrency(goal.currentAmount)} saved</span>
                  <span className="text-gray">Goal: {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-2 bg-gray rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: categoryColor }}
                  />
                </div>
                <p className="text-xs text-gray mt-1">{progress.toFixed(0)}% complete</p>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray">
                <div>
                  <p className="text-gray">{monthsRemaining} months remaining</p>
                </div>
                <div className="text-right">
                  <p className="text-gray">Save {formatCurrency(monthlyNeeded)}/month</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <p className="text-gray text-center py-8">
          No goals yet. Click "Add Goal" to start tracking your financial goals.
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-transparent">
        <p className="text-xs text-gray text-center">
          Tip: Set realistic target dates and adjust your monthly savings to meet your goals.
        </p>
      </div>
    </div>
  );
}