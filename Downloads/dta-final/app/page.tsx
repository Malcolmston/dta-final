"use client";

import { useState, useEffect } from "react";
import { useColorPalette } from "./context/ColorPaletteContext";
import DashboardTabs, { DashboardSection } from "./components/DashboardTabs";
import MarketPredictor from "./components/MarketPredictor";
import TechnicalAnalysis from "./components/TechnicalAnalysis";
import Heatmap from "./components/Heatmap";
import Treemap from "./components/Treemap";
import NetworkGraph from "./components/NetworkGraph";
import Streamgraph from "./components/Streamgraph";
import PriceRibbon3D from "./components/PriceRibbon3D";
import AnalysisTabs from "./components/AnalysisTabs";
import PortfolioPieChart from "./components/PortfolioPieChart";
import PortfolioManager from "./components/PortfolioManager";
import CandlestickChart from "./components/CandlestickChart";
import TreemapBoxes from "./components/Treemap"; // Use 2D version instead of 3D
import MarketFactors from "./components/MarketFactors";
import SectionAnalytics from "./components/SectionAnalytics";
import DualAxisPlot from "./components/DualAxisPlot";
import LagCorrelationPlot from "./components/LagCorrelationPlot";
import ConfusionMatrixPlot from "./components/ConfusionMatrixPlot";
import ChartAnalysis from "./components/ChartAnalysis";
import OverviewSection from "./components/OverviewSection";
import RetirementCalculator from "./components/RetirementCalculator";
import GoalTracking from "./components/GoalTracking";
import AssetAllocation from "./components/AssetAllocation";
import ActionItemsPanel from "./components/ActionItemsPanel";
import InvestmentGoalsWizard, { useInvestmentGoals, InvestmentGoals } from "./components/InvestmentGoalsWizard";
import IncomeTrackingPanel from "./components/IncomeTrackingPanel";
import CostBasisInput from "./components/CostBasisInput";
import SurvivorshipBiasBanner from "./components/SurvivorshipBiasDisclaimer";
import EmergencyFundCheck from "./components/EmergencyFundCheck";
import DiversificationAnalyzer from "./components/DiversificationAnalyzer";
import RiskMetricsPanel from "./components/RiskMetricsPanel";
import RebalancingAlerts from "./components/RebalancingAlerts";
import FeeDisclosure from "./components/FeeDisclosure";
import TaxAwareFeatures from "./components/TaxAwareFeatures";
import BenchmarkComparison from "./components/BenchmarkComparison";
import CashFlowTracking from "./components/CashFlowTracking";
import ErrorBoundary from "./components/ErrorBoundary";
import VolumeChart from "./components/VolumeChart";

const CHART_CONFIG_KEY = "chart_config";

interface ChartConfig {
  activeSection: DashboardSection;
  isSimpleMode: boolean;
  darkMode: boolean;
}

const loadChartConfig = (): ChartConfig | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CHART_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveChartConfig = (config: ChartConfig) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHART_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save chart config:", e);
  }
};

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const { palette, isDarkMode, setIsDarkMode } = useColorPalette();
  const { goals, updateGoals } = useInvestmentGoals();

  // Load saved configuration on mount
  useEffect(() => {
    if (initialized) return;
    const config = loadChartConfig();
    if (config) {
      setActiveSection(config.activeSection);
      setIsSimpleMode(config.isSimpleMode);
      setIsDarkMode(config.darkMode);
    }
    setInitialized(true);
  }, [initialized, setIsDarkMode]);

  // Save configuration when it changes
  useEffect(() => {
    if (!initialized) return;
    saveChartConfig({
      activeSection,
      isSimpleMode,
      darkMode: isDarkMode,
    });
  }, [activeSection, isSimpleMode, isDarkMode, initialized]);

  const renderSection = () => {
    // Simple mode content (for beginners)
    if (isSimpleMode) {
      switch (activeSection) {
        case "overview":
          return <OverviewSection />;

        case "trends":
          return (
            <>
              <SectionAnalytics section="trends" />
              {/* Issue 31: Use 2D charts in simple mode for clarity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Price Trends</h3>
                <CandlestickChart ticker="AAPL" />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Trading Activity</h3>
                <CandlestickChart ticker="AAPL" period="3mo" />
              </div>
            </>
          );

        case "factors":
          return (
            <>
              <SectionAnalytics section="factors" />
              <div className="mb-6">
                <MarketFactors />
                <ChartAnalysis chartType="MarketFactors" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Economic Trends</h3>
                <DualAxisPlot />
                <ChartAnalysis chartType="DualAxisPlot" isSimpleMode={isSimpleMode} />
              </div>
            </>
          );

        case "sectors":
          return (
            <>
              <SectionAnalytics section="sectors" />
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Sector Performance</h3>
                <Heatmap />
                <ChartAnalysis chartType="Heatmap" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Market Segments</h3>
                <Treemap />
                <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
              </div>
            </>
          );

        case "analysis":
          return (
            <>
              <SectionAnalytics section="analysis" />
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Analysis</h3>
                <AnalysisTabs />
                <ChartAnalysis chartType="AnalysisTabs" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Stock Connections</h3>
                <NetworkGraph />
                <ChartAnalysis chartType="NetworkGraph" isSimpleMode={isSimpleMode} />
              </div>
            </>
          );

        case "portfolio":
          return (
            <>
              <SectionAnalytics section="portfolio" />
              <SurvivorshipBiasBanner />
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Your Investments</h3>
                <PortfolioManager />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Portfolio Allocation</h3>
                <PortfolioPieChart />
                <ChartAnalysis chartType="PortfolioPieChart" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Income Tracking</h3>
                <IncomeTrackingPanel />
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Cost Basis & P&L</h3>
                <CostBasisInput />
              </div>
            </>
          );

        case "wealth":
          return (
            <div className="max-w-5xl mx-auto">
              <SectionAnalytics section="wealth" />
              {/* Issue 27: Time horizon wizard - show before advice */}
              {!goals.hasCompletedWizard && (
                <div className="mb-6">
                  <InvestmentGoalsWizard
                    goals={goals}
                    onGoalsComplete={updateGoals}
                    onSkip={() => updateGoals({ ...goals, hasCompletedWizard: true })}
                  />
                </div>
              )}
              {/* Wealth cards with consistent sizing */}
              <div className="grid gap-6">
                <div className="min-h-[200px]">
                  <ActionItemsPanel />
                </div>
                <div className="min-h-[200px]">
                  <RetirementCalculator />
                </div>
                <div className="min-h-[200px]">
                  <GoalTracking />
                </div>
                <div className="min-h-[200px]">
                  <AssetAllocation />
                </div>

                {/* Issue 22: Emergency Fund Check */}
                <div className="min-h-[200px]">
                  <EmergencyFundCheck />
                </div>

                {/* Issue 23: Diversification Analysis */}
                <div className="min-h-[200px]">
                  <DiversificationAnalyzer />
                </div>

                {/* Issue 24: Risk Metrics Panel */}
                <div className="min-h-[200px]">
                  <RiskMetricsPanel />
                </div>

                {/* Issue 25: Rebalancing Alerts */}
                <div className="min-h-[200px]">
                  <RebalancingAlerts />
                </div>

                {/* Issue 18: Fee Disclosure */}
                <div className="min-h-[200px]">
                  <FeeDisclosure />
                </div>

                {/* Issue 19: Tax-Aware Features */}
                <div className="min-h-[200px]">
                  <TaxAwareFeatures />
                </div>

                {/* Issue 20: Benchmark Comparison */}
                <div className="min-h-[200px]">
                  <BenchmarkComparison />
                </div>

                {/* Issue 21: Cash Flow Analysis */}
                <div className="min-h-[200px]">
                  <CashFlowTracking />
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    // Detailed mode content (for advanced users)
    switch (activeSection) {
      case "overview":
        return <OverviewSection />;

      case "trends":
        return (
          <>
            <SectionAnalytics section="trends" />
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">3D Candlestick OHLCV</h3>
              <CandlestickChart />
              <ChartAnalysis chartType="CandlestickChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Volume Profile Analysis</h3>
              <VolumeChart />
              <ChartAnalysis chartType="VolumeChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Ticker Performance Comparison</h3>
              <Streamgraph />
              <ChartAnalysis chartType="Streamgraph" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Moving Average Ribbon</h3>
              <PriceRibbon3D />
              <ChartAnalysis chartType="PriceRibbon3D" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "factors":
        return (
          <>
            <SectionAnalytics section="factors" />
            <div className="mb-6">
              <MarketFactors />
              <ChartAnalysis chartType="MarketFactors" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Temporal Lag Analysis</h3>
              <LagCorrelationPlot />
              <ChartAnalysis chartType="LagCorrelationPlot" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "sectors":
        return (
          <>
            <SectionAnalytics section="sectors" />
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Sector Performance Heatmap</h3>
              <Heatmap />
              <ChartAnalysis chartType="Heatmap" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Sector Allocation</h3>
              <TreemapBoxes />
              <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "analysis":
        return (
          <>
            <SectionAnalytics section="analysis" />
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Indicator Technical Panel</h3>
              <AnalysisTabs />
              <ChartAnalysis chartType="AnalysisTabs" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">ML Model Performance Matrix</h3>
              <ConfusionMatrixPlot />
              <ChartAnalysis chartType="ConfusionMatrixPlot" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "portfolio":
        return (
          <div className="max-w-5xl mx-auto">
            <SectionAnalytics section="portfolio" />
            <SurvivorshipBiasBanner />
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">My Portfolio</h3>
              <PortfolioManager />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Portfolio Weight Distribution</h3>
              <PortfolioPieChart />
              <ChartAnalysis chartType="PortfolioPieChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Holdings Map</h3>
              <Treemap />
              <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Income Tracking</h3>
              <IncomeTrackingPanel />
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Cost Basis & P&L</h3>
              <CostBasisInput />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen font-sans transition-colors duration-300"
        style={{ backgroundColor: palette.background, color: palette.text }}
      >
        {/* Header */}
        <header
          className="border-b sticky top-0 z-40 transition-colors duration-300"
          style={{
            backgroundColor: palette.background,
            borderColor: palette.gridLines,
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: palette.text }}>
                Stock Market Dashboard
              </h1>
              <p className="text-sm mt-0.5" style={{ color: palette.text, opacity: 0.7 }}>
                {isSimpleMode ? "Simplified View" : "Detailed View"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all hover:opacity-80"
                style={{
                  backgroundColor: isDarkMode ? palette.secondary : palette.background,
                  borderColor: palette.gridLines,
                }}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
                <span className="text-sm font-medium" style={{ color: palette.text }}>
                  {isDarkMode ? "Light" : "Dark"}
                </span>
              </button>
              <button
                onClick={() => setIsSimpleMode(!isSimpleMode)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isSimpleMode ? palette.primary : palette.gridLines,
                  color: isSimpleMode ? "#ffffff" : palette.text,
                }}
              >
                {isSimpleMode ? "Simple Mode" : "Detailed Mode"}
              </button>
              <span className="text-xs uppercase tracking-wider" style={{ color: palette.text, opacity: 0.5 }}>
                Last updated: Today
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <div className="flex">
        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-6 pr-56 transition-colors duration-300">
          {renderSection()}
        </main>

        {/* Vertical Tab Navigation */}
        <DashboardTabs
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Footer */}
      <footer
        className="border-t mt-12 ml-48 transition-colors duration-300"
        style={{
          backgroundColor: palette.background,
          borderColor: palette.gridLines,
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between text-sm" style={{ color: palette.text, opacity: 0.6 }}>
            <p>Stock Market Dashboard - Educational & Analysis Tools</p>
            <p>Data provided for educational purposes</p>
          </div>
        </div>
      </footer>
    </div>
    </ErrorBoundary>
  );
}