"use client";

import { useState } from "react";

interface DisclaimerBannerProps {
  minimal?: boolean;
}

export default function DisclaimerBanner({ minimal = false }: DisclaimerBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700 font-semibold">
            NOT INVESTMENT ADVICE • FOR EDUCATIONAL PURPOSES ONLY
          </p>
          {!minimal && (
            <div className="mt-2 text-sm text-amber-600">
              <p>The information provided is for educational and informational purposes only.
              It should not be construed as investment advice, financial advice, or any other form of professional advice.</p>
              <p className="mt-2 font-medium">BUY/SELL/HOLD signals are NOT financial recommendations.</p>
              <p className="mt-2">Trading signals are generated using technical indicators (RSI, MACD, moving averages) which have
              no guaranteed predictive value. Past performance does not guarantee future results. Always consult with a
              qualified financial advisor before making investment decisions.</p>
            </div>
          )}
          {!minimal && (
            <button onClick={() => setDismissed(true)} className="mt-3 text-xs text-amber-600 hover:text-amber-800 underline">
              Dismiss this notice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}