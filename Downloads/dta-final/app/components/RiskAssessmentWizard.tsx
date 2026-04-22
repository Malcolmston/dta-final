"use client";

import { useState } from "react";

interface RiskProfile {
  age: number;
  income: number;
  goals: string[];
  riskTolerance: "conservative" | "moderate" | "aggressive";
  timeHorizon: number;
  completed: boolean;
}

interface RiskAssessmentWizardProps {
  onComplete: (profile: RiskProfile) => void;
}

export default function RiskAssessmentWizard({ onComplete }: RiskAssessmentWizardProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<RiskProfile>({
    age: 30,
    income: 50000,
    goals: [],
    riskTolerance: "moderate",
    timeHorizon: 10,
    completed: false
  });

  const updateProfile = (updates: Partial<RiskProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleGoalToggle = (goal: string) => {
    const goals = profile.goals.includes(goal)
      ? profile.goals.filter(g => g !== goal)
      : [...profile.goals, goal];
    updateProfile({ goals });
  };

  const handleComplete = () => {
    updateProfile({ completed: true });
    onComplete(profile);
  };

  if (profile.completed) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Investment Profile</h2>
          <p className="text-gray-600 mb-6">To provide appropriate recommendations, we need to understand your situation better.</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">What is your age?</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min={18}
              max={100}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
            <select
              value={profile.income}
              onChange={(e) => updateProfile({ income: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={25000}>Under $25,000</option>
              <option value={50000}>$25,000 - $50,000</option>
              <option value={75000}>$50,000 - $75,000</option>
              <option value={100000}>$75,000 - $100,000</option>
              <option value={150000}>$100,000 - $150,000</option>
              <option value={150001}>Over $150,000</option>
            </select>
          </div>

          <button onClick={() => setStep(2)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Investment Goals</h2>
          <p className="text-gray-600 mb-6">What are you trying to achieve?</p>

          <div className="space-y-3 mb-6">
            {[
              { id: "retirement", label: "Retirement Savings", desc: "Long-term wealth building for retirement" },
              { id: "growth", label: "Capital Growth", desc: "Maximize returns over time" },
              { id: "income", label: "Income Generation", desc: "Regular dividend income" },
              { id: "preservation", label: "Wealth Preservation", desc: "Protect existing assets" },
            ].map(goal => (
              <label key={goal.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={profile.goals.includes(goal.id)}
                  onChange={() => handleGoalToggle(goal.id)}
                  className="h-5 w-5 text-blue-600"
                />
                <div className="ml-3">
                  <div className="font-medium">{goal.label}</div>
                  <div className="text-sm text-gray-500">{goal.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </button>
            <button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Risk Tolerance</h2>
          <p className="text-gray-600 mb-6">How do you feel about investment risk?</p>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => updateProfile({ riskTolerance: "conservative" })}
              className={`w-full p-4 border rounded-lg text-left ${profile.riskTolerance === "conservative" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="font-medium">Conservative</div>
              <div className="text-sm text-gray-500">Preserve capital, accept lower returns for less risk</div>
            </button>
            <button
              onClick={() => updateProfile({ riskTolerance: "moderate" })}
              className={`w-full p-4 border rounded-lg text-left ${profile.riskTolerance === "moderate" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="font-medium">Moderate</div>
              <div className="text-sm text-gray-500">Balance between growth and stability</div>
            </button>
            <button
              onClick={() => updateProfile({ riskTolerance: "aggressive" })}
              className={`w-full p-4 border rounded-lg text-left ${profile.riskTolerance === "aggressive" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
            >
              <div className="font-medium">Aggressive</div>
              <div className="text-sm text-gray-500">Maximize growth, accept significant volatility</div>
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </button>
            <button onClick={() => setStep(4)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Time Horizon</h2>
          <p className="text-gray-600 mb-6">How long do you plan to keep your investments?</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Investment Time Horizon (years)</label>
            <input
              type="range"
              min={1}
              max={30}
              value={profile.timeHorizon}
              onChange={(e) => updateProfile({ timeHorizon: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-lg font-medium mt-2">{profile.timeHorizon} years</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Your Risk Profile</h3>
            <p className="text-sm text-blue-800">
              {profile.riskTolerance.charAt(0).toUpperCase() + profile.riskTolerance.slice(1)} investor • {profile.timeHorizon} years
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <p className="text-sm text-amber-700">
              <strong>Important:</strong> This assessment is for educational purposes only and does not constitute professional financial advice.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Back
            </button>
            <button onClick={handleComplete} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Complete Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}