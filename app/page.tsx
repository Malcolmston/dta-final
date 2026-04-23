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
import Candlestick3DChart from "./components/Candlestick3DChart";
import Volume3DBars from "./components/Volume3DBars";
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

  // Toggle .dark class on body for CSS variable support
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

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
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Price Trends</h3>
                <CandlestickChart ticker="AAPL" />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Trading Activity</h3>
                <CandlestickChart ticker="AAPL" period="3mo" />
              </div>
            </>
          );

        case "factors":
          return (
            <>
              <SectionAnalytics section="factors" />
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <MarketFactors />
                <ChartAnalysis chartType="MarketFactors" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Economic Trends</h3>
                <DualAxisPlot />
                <ChartAnalysis chartType="DualAxisPlot" isSimpleMode={isSimpleMode} />
              </div>
            </>
          );

        case "sectors":
          return (
            <>
              <SectionAnalytics section="sectors" />
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Sector Performance</h3>
                <Heatmap />
                <ChartAnalysis chartType="Heatmap" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Market Segments</h3>
                <Treemap />
                <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
              </div>
            </>
          );

        case "analysis":
          return (
            <>
              <SectionAnalytics section="analysis" />
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Technical Analysis</h3>
                <AnalysisTabs />
                <ChartAnalysis chartType="AnalysisTabs" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Stock Connections</h3>
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
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Your Investments</h3>
                <PortfolioManager />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Portfolio Allocation</h3>
                <PortfolioPieChart />
                <ChartAnalysis chartType="PortfolioPieChart" isSimpleMode={isSimpleMode} />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Income Tracking</h3>
                <IncomeTrackingPanel />
              </div>
              <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Cost Basis & P&L</h3>
                <CostBasisInput />
              </div>
            </>
          );

        case "wealth":
          return (
            <div className="max-w-5xl mx-auto">
              <SectionAnalytics section="wealth" />

              {/* Investment Goals Section */}
              <div className="mb-8">
                {!goals.hasCompletedWizard ? (
                  <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                    <InvestmentGoalsWizard
                      goals={goals}
                      onGoalsComplete={updateGoals}
                      onSkip={() => updateGoals({ ...goals, hasCompletedWizard: true })}
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: palette.text }}>Your Investment Profile</h2>
                        <p className="text-sm mt-1" style={{ color: palette.text, opacity: 0.7 }}>Setup complete</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: palette.primary + "20", color: palette.primary }}>
                          {goals.riskTolerance || "Moderate"} Risk
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: palette.positive + "20", color: palette.positive }}>
                          {goals.timeHorizon || 10}+ Years
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: palette.secondary + "20", color: palette.secondary }}>
                          {goals.primaryGoal || "Retirement"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Tools - 2 cards per row */}
              <div className="space-y-6">
                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Retirement Planning</h3>
                  <RetirementCalculator />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Goal Tracking</h3>
                  <GoalTracking />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Asset Allocation</h3>
                  <AssetAllocation />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Rebalancing Alerts</h3>
                  <RebalancingAlerts />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Risk Metrics</h3>
                  <RiskMetricsPanel />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Emergency Fund</h3>
                  <EmergencyFundCheck />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: palette.text }}>Cash Flow</h3>
                  <CashFlowTracking />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <ActionItemsPanel />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <TaxAwareFeatures />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <BenchmarkComparison />
                </div>

                <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
                  <FeeDisclosure />
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
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Candlestick Chart</h3>
              <CandlestickChart />
              <ChartAnalysis chartType="CandlestickChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Volume Analysis</h3>
              <VolumeChart />
              <ChartAnalysis chartType="VolumeChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Multi-Ticker Performance</h3>
              <Streamgraph />
              <ChartAnalysis chartType="Streamgraph" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Moving Average Ribbon</h3>
              <PriceRibbon3D />
              <ChartAnalysis chartType="PriceRibbon3D" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "factors":
        return (
          <>
            <SectionAnalytics section="factors" />
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <MarketFactors />
              <ChartAnalysis chartType="MarketFactors" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Temporal Lag Analysis</h3>
              <LagCorrelationPlot />
              <ChartAnalysis chartType="LagCorrelationPlot" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "sectors":
        return (
          <>
            <SectionAnalytics section="sectors" />
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Sector Performance Heatmap</h3>
              <Heatmap />
              <ChartAnalysis chartType="Heatmap" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Sector Allocation</h3>
              <TreemapBoxes />
              <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
            </div>
          </>
        );

      case "analysis":
        return (
          <>
            <SectionAnalytics section="analysis" />
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Multi-Indicator Technical Panel</h3>
              <AnalysisTabs />
              <ChartAnalysis chartType="AnalysisTabs" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>ML Model Performance Matrix</h3>
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
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>My Portfolio</h3>
              <PortfolioManager />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Portfolio Weight Distribution</h3>
              <PortfolioPieChart />
              <ChartAnalysis chartType="PortfolioPieChart" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Holdings Map</h3>
              <Treemap />
              <ChartAnalysis chartType="Treemap" isSimpleMode={isSimpleMode} />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Income Tracking</h3>
              <IncomeTrackingPanel />
            </div>
            <div className="mb-6 p-6 rounded-xl border" style={{ backgroundColor: palette.background, borderColor: palette.gridLines }}>
              <h3 className="font-semibold mb-2" style={{ color: palette.text }}>Cost Basis & P&L</h3>
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