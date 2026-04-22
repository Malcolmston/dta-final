"use client";

import { useState } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
}

export default function ActionItemsPanel() {
  const { palette } = useColorPalette();
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Sample action items based on portfolio analysis
  const [actionItems] = useState<ActionItem[]>([
    {
      id: "1",
      title: "Your portfolio is heavily weighted in technology",
      description: "Tech stocks represent 45% of your portfolio. Consider diversifying across sectors to reduce risk.",
      priority: "high",
      category: "Diversification",
    },
    {
      id: "2",
      title: "You're 5 years from retirement - review allocation",
      description: "With retirement approaching, consider shifting toward more conservative investments to protect your savings.",
      priority: "high",
      category: "Retirement",
    },
    {
      id: "3",
      title: "Consider tax-loss harvesting",
      description: "You've had consistent gains this year. Consider tax-loss harvesting to offset capital gains.",
      priority: "medium",
      category: "Tax",
    },
    {
      id: "4",
      title: "Rebalance your portfolio",
      description: "Your asset allocation has drifted 8% from your target. Consider rebalancing to maintain your risk profile.",
      priority: "medium",
      category: "Rebalancing",
    },
    {
      id: "5",
      title: "Emergency fund check",
      description: "Ensure you have 3-6 months of expenses in liquid savings before continuing to invest.",
      priority: "medium",
      category: "Safety",
    },
  ]);

  const visibleItems = actionItems.filter((item) => !dismissed.includes(item.id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return palette.negative;
      case "medium":
        return palette.accent;
      default:
        return palette.secondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Diversification":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "Retirement":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "Tax":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        );
      case "Rebalancing":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (visibleItems.length === 0) {
    return (
      <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
          <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Action Items
        </h3>
        <p className="text-center py-4" style={{ color: palette.text, opacity: 0.7 }}>All caught up! No action items at this time.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-sm border p-6" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.text }}>
        <svg className="w-5 h-5" style={{ color: palette.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Action Items
        <span className="ml-auto text-sm font-normal" style={{ color: palette.text, opacity: 0.6 }}>{visibleItems.length} items</span>
      </h3>

      <div className="space-y-3">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            style={{ borderColor: palette.gridLines, backgroundColor: palette.background }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getPriorityColor(item.priority) + "20", color: getPriorityColor(item.priority) }}
                >
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold" style={{ color: palette.text }}>{item.title}</h4>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: getPriorityColor(item.priority) + "20",
                        color: getPriorityColor(item.priority)
                      }}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>{item.description}</p>
                  <p className="text-xs mt-2" style={{ color: palette.text, opacity: 0.5 }}>Category: {item.category}</p>
                </div>
              </div>
              <button
                onClick={() => setDismissed([...dismissed, item.id])}
                className="p-1"
                style={{ color: palette.text, opacity: 0.5 }}
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs mt-4 text-center" style={{ color: palette.text, opacity: 0.5 }}>
        These are automated suggestions based on your portfolio. Consult a financial advisor for personalized advice.
      </p>
    </div>
  );
}