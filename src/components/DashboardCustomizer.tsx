import React, { useState } from 'react';

// Interface for dashboard section configuration
export interface DashboardConfig {
  showCoreMetrics: boolean;
  showAdvancedMetrics: boolean;
  showBenchmark: boolean;
  showEquityCurve: boolean;
  showDrawdown: boolean;
  showMonteCarloSim: boolean;
  showRiskRewardMap: boolean;
  showCorrelationMatrix: boolean;
  showDrawdownWaterfall: boolean;
  showParameterAnalysis: boolean;
  showTradeClustering: boolean;
}

// Default configuration
export const defaultConfig: DashboardConfig = {
  showCoreMetrics: true,
  showAdvancedMetrics: true,
  showBenchmark: true,
  showEquityCurve: true,
  showDrawdown: true,
  showMonteCarloSim: true,
  showRiskRewardMap: true,
  showCorrelationMatrix: true,
  showDrawdownWaterfall: true,
  showParameterAnalysis: true,
  showTradeClustering: false
};

interface DashboardCustomizerProps {
  config: DashboardConfig;
  onConfigChange: (newConfig: DashboardConfig) => void;
}

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ 
  config, 
  onConfigChange 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Toggle a specific config option
  const toggleOption = (option: keyof DashboardConfig) => {
    onConfigChange({
      ...config,
      [option]: !config[option]
    });
  };

  // Reset to default configuration
  const resetToDefault = () => {
    onConfigChange(defaultConfig);
  };

  return (
    <div className="dashboard-customizer">
      <button 
        className="customizer-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        title="Customize Dashboard"
      >
        <span className="customizer-icon">⚙️</span>
        <span className="customizer-label">
          {isOpen ? 'Close Customizer' : 'Customize Dashboard'}
        </span>
      </button>

      {isOpen && (
        <div className="customizer-panel">
          <div className="customizer-header">
            <h3>Dashboard Customization</h3>
            <button 
              className="reset-button" 
              onClick={resetToDefault}
              title="Reset to default configuration"
            >
              Reset to Default
            </button>
          </div>

          <div className="options-grid">
            <div className="option-category">
              <h4>Core Sections</h4>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showCoreMetrics} 
                  onChange={() => toggleOption('showCoreMetrics')}
                />
                <span>Core Metrics</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showAdvancedMetrics} 
                  onChange={() => toggleOption('showAdvancedMetrics')}
                />
                <span>Advanced Metrics</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showBenchmark} 
                  onChange={() => toggleOption('showBenchmark')}
                />
                <span>Benchmark Comparison</span>
              </label>
            </div>

            <div className="option-category">
              <h4>Charts</h4>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showEquityCurve} 
                  onChange={() => toggleOption('showEquityCurve')}
                />
                <span>Equity Curve</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showDrawdown} 
                  onChange={() => toggleOption('showDrawdown')}
                />
                <span>Drawdown Chart</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showDrawdownWaterfall} 
                  onChange={() => toggleOption('showDrawdownWaterfall')}
                />
                <span>Drawdown Waterfall</span>
              </label>
            </div>

            <div className="option-category">
              <h4>Advanced Analysis</h4>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showMonteCarloSim} 
                  onChange={() => toggleOption('showMonteCarloSim')}
                />
                <span>Monte Carlo Simulation</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showRiskRewardMap} 
                  onChange={() => toggleOption('showRiskRewardMap')}
                />
                <span>Risk-Reward Map</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showCorrelationMatrix} 
                  onChange={() => toggleOption('showCorrelationMatrix')}
                />
                <span>Correlation Matrix</span>
              </label>
            </div>

            <div className="option-category">
              <h4>Parameter Analysis</h4>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showParameterAnalysis} 
                  onChange={() => toggleOption('showParameterAnalysis')}
                />
                <span>Parameter Heatmap</span>
              </label>
              <label className="option-toggle">
                <input 
                  type="checkbox" 
                  checked={config.showTradeClustering} 
                  onChange={() => toggleOption('showTradeClustering')}
                />
                <span>Trade Clustering</span>
              </label>
            </div>
          </div>

          <div className="customizer-footer">
            <p>Your preferences will be saved automatically.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCustomizer; 