"use client";

import { useState, useEffect } from "react";
import { useColorPalette } from "../context/ColorPaletteContext";

export type InvestmentGoal =
  | "retirement"
  | "house"
  | "education"
  | "emergency"
  | "wealth"
  | "income";

export interface InvestmentGoals {
  primaryGoal: InvestmentGoal | null;
  timeHorizon: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
  hasCompletedWizard: boolean;
}

interface InvestmentGoalsWizardProps {
  goals: InvestmentGoals;
  onGoalsComplete: (goals: InvestmentGoals) => void;
  onSkip: () => void;
}

const GOAL_INFO: Record<InvestmentGoal, { title: string; description: string; icon: string }> = {
  retirement: {
    title: "Retirement",
    description: "Long-term savings for when you stop working",
    icon: "1",
  },
  house: {
    title: "Home Purchase",
    description: "Saving for a down payment on a home",
    icon: "2",
  },
  education: {
    title: "Education",
    description: "Saving for college or continuing education",
    icon: "3",
  },
  emergency: {
    title: "Emergency Fund",
    description: "Safety net for unexpected expenses",
    icon: "4",
  },
  wealth: {
    title: "Wealth Building",
    description: "Growing your money over time",
    icon: "5",
  },
  income: {
    title: "Income Generation",
    description: "Creating regular income from investments",
    icon: "6",
  },
};

export default function InvestmentGoalsWizard({
  goals,
  onGoalsComplete,
  onSkip,
}: InvestmentGoalsWizardProps) {
  const { palette } = useColorPalette();
  const [step, setStep] = useState(1);
  const [localGoals, setLocalGoals] = useState<InvestmentGoals>(goals);

  useEffect(() => {
    const saved = localStorage.getItem("investmentGoals");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalGoals(parsed);
        if (parsed.hasCompletedWizard) {
          onGoalsComplete(parsed);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleGoalSelect = (goal: InvestmentGoal) => {
    setLocalGoals({ ...localGoals, primaryGoal: goal });
    setStep(2);
  };

  const handleTimeHorizonSelect = (years: number) => {
    setLocalGoals({ ...localGoals, timeHorizon: years });
    setStep(3);
  };

  const handleRiskSelect = (risk: "conservative" | "moderate" | "aggressive") => {
    const updatedGoals = {
      ...localGoals,
      riskTolerance: risk,
      hasCompletedWizard: true,
    };
    setLocalGoals(updatedGoals);
    localStorage.setItem("investmentGoals", JSON.stringify(updatedGoals));
    onGoalsComplete(updatedGoals);
  };

  const getRecommendedAllocation = () => {
    const { riskTolerance, timeHorizon } = localGoals;

    if (riskTolerance === "conservative" || timeHorizon < 3) {
      return { stocks: 30, bonds: 50, cds: 15, cash: 5 };
    } else if (riskTolerance === "moderate") {
      return { stocks: 60, bonds: 25, cds: 10, cash: 5 };
    } else {
      return { stocks: 80, bonds: 15, cds: 0, cash: 5 };
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: palette.background, border: `1px solid ${palette.gridLines}` }}>
        <div
          className="px-6 py-4 border-b"
          style={{ backgroundColor: palette.primary + '10', borderColor: palette.gridLines }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: palette.primary, color: 'white' }}
            >
              ?
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: palette.text }}>
                Investment Goals Wizard
              </h2>
              <p className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>
                Step {step} of 3 - Help us personalize your experience
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: s <= step ? palette.primary : palette.gridLines,
                  opacity: s <= step ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
                What is your primary investment goal?
              </h3>
              <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
                This helps us provide appropriate recommendations for your situation.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(GOAL_INFO) as InvestmentGoal[]).map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalSelect(goal)}
                    className="p-4 rounded-lg border-2 text-left transition-all hover:shadow-md"
                    style={{
                      borderColor: localGoals.primaryGoal === goal ? palette.primary : palette.gridLines,
                      backgroundColor: localGoals.primaryGoal === goal ? palette.primary + '10' : palette.background,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full mb-2 flex items-center justify-center font-bold" style={{ backgroundColor: palette.primary + '20', color: palette.primary }}>
                      {GOAL_INFO[goal].icon}
                    </div>
                    <div className="font-semibold" style={{ color: palette.text }}>
                      {GOAL_INFO[goal].title}
                    </div>
                    <div className="text-sm mt-1" style={{ color: palette.text, opacity: 0.6 }}>
                      {GOAL_INFO[goal].description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onSkip}
                  className="text-sm underline"
                  style={{ color: palette.text, opacity: 0.5 }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
                When do you plan to use this money?
              </h3>
              <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
                Your time horizon affects how much risk you can afford to take.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { years: 1, label: "Less than 3 years", category: "Short-term" },
                  { years: 5, label: "3-10 years", category: "Medium-term" },
                  { years: 15, label: "10+ years", category: "Long-term" },
                ].map(({ years, label, category }) => (
                  <button
                    key={years}
                    onClick={() => handleTimeHorizonSelect(years)}
                    className="p-4 rounded-lg border-2 text-center transition-all hover:shadow-md"
                    style={{
                      borderColor: localGoals.timeHorizon === years ? palette.primary : palette.gridLines,
                      backgroundColor: localGoals.timeHorizon === years ? palette.primary + '10' : palette.background,
                    }}
                  >
                    <div className="text-3xl font-bold mb-2" style={{ color: palette.primary }}>
                      {years}+
                    </div>
                    <div className="font-semibold" style={{ color: palette.text }}>
                      {label}
                    </div>
                    <div className="text-xs mt-1" style={{ color: palette.text, opacity: 0.5 }}>
                      {category}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-6 text-sm flex items-center gap-1"
                style={{ color: palette.text, opacity: 0.6 }}
              >
                Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: palette.text }}>
                How comfortable are you with investment risk?
              </h3>
              <p className="text-sm mb-6" style={{ color: palette.text, opacity: 0.7 }}>
                Higher potential returns usually come with higher risk.
              </p>

              <div className="space-y-4">
                {[
                  {
                    key: "conservative",
                    label: "Conservative",
                    description: "Prefer stability over growth. I'm okay with lower returns to avoid losses.",
                    color: palette.positive,
                  },
                  {
                    key: "moderate",
                    label: "Moderate",
                    description: "Balance between growth and stability. I can handle some ups and downs.",
                    color: palette.secondary,
                  },
                  {
                    key: "aggressive",
                    label: "Aggressive",
                    description: "Focus on growth. I can handle significant ups and downs in value.",
                    color: palette.negative,
                  },
                ].map(({ key, label, description, color }) => (
                  <button
                    key={key}
                    onClick={() => handleRiskSelect(key as "conservative" | "moderate" | "aggressive")}
                    className="w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md"
                    style={{
                      borderColor: localGoals.riskTolerance === key ? color : palette.gridLines,
                      backgroundColor: localGoals.riskTolerance === key ? color + '10' : palette.background,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold" style={{ color: palette.text }}>
                        {label}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          borderColor: color,
                          backgroundColor: localGoals.riskTolerance === key ? color : 'transparent',
                        }}
                      />
                    </div>
                    <div className="text-sm mt-1" style={{ color: palette.text, opacity: 0.6 }}>
                      {description}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-6 text-sm flex items-center gap-1"
                style={{ color: palette.text, opacity: 0.6 }}
              >
                Back
              </button>
            </div>
          )}
        </div>

        {localGoals.hasCompletedWizard && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderColor: palette.gridLines, backgroundColor: palette.positive + '10' }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold" style={{ color: palette.positive }}>OK</div>
              <div>
                <div className="font-semibold" style={{ color: palette.text }}>
                  Your profile is set up!
                </div>
                <div className="text-sm" style={{ color: palette.text, opacity: 0.7 }}>
                  Recommended allocation: {getRecommendedAllocation().stocks}% stocks, {getRecommendedAllocation().bonds}% bonds
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function useInvestmentGoals() {
  const [goals, setGoals] = useState<InvestmentGoals>({
    primaryGoal: null,
    timeHorizon: 10,
    riskTolerance: "moderate",
    hasCompletedWizard: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("investmentGoals");
    if (saved) {
      try {
        setGoals(JSON.parse(saved));
      } catch (e) {
        // Use defaults
      }
    }
  }, []);

  const updateGoals = (newGoals: InvestmentGoals) => {
    setGoals(newGoals);
    localStorage.setItem("investmentGoals", JSON.stringify(newGoals));
  };

  const resetGoals = () => {
    setGoals({
      primaryGoal: null,
      timeHorizon: 10,
      riskTolerance: "moderate",
      hasCompletedWizard: false,
    });
    localStorage.removeItem("investmentGoals");
  };

  return { goals, updateGoals, resetGoals };
}