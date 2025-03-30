import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NumericFormat } from 'react-number-format';

interface MonteCarloProps {
  equityCurve: Array<{
    name: string;
    returns: number;
    drawdown?: number;
    buyAndHoldValue?: number;
  }>;
  initialCapital: number;
  simulations?: number;
}

const MonteCarlo: React.FC<MonteCarloProps> = ({ 
  equityCurve, 
  initialCapital, 
  simulations = 100 
}) => {
  // Calculate historical volatility and returns
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prevValue = equityCurve[i-1].returns;
    const currentValue = equityCurve[i].returns;
    returns.push((currentValue - prevValue) / prevValue);
  }

  // Calculate volatility
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const dailyVolatility = Math.sqrt(variance);

  // Generate simulation results
  const simulationResults = React.useMemo(() => {
    const results = [];
    const timePoints = equityCurve.map(point => point.name);
    
    // Create a base timeline with just names
    const timeline = timePoints.map(name => ({ name }));
    
    // Generate paths
    for (let i = 0; i < simulations; i++) {
      let value = initialCapital;
      const path = timeline.map((point, index) => {
        if (index === 0) {
          return { ...point, value: initialCapital };
        }
        
        // Generate random return based on historical volatility
        const randomReturn = avgReturn + (dailyVolatility * (Math.random() * 4 - 2)); // Normal-ish distribution
        value = value * (1 + randomReturn);
        
        return { ...point, value };
      });
      
      results.push(path);
    }
    
    return results;
  }, [equityCurve, initialCapital, simulations, avgReturn, dailyVolatility]);

  // Calculate percentiles
  const percentileData = React.useMemo(() => {
    if (simulationResults.length === 0) return [];

    return simulationResults[0].map((point, timeIndex) => {
      const allValuesAtTime = simulationResults.map(sim => sim[timeIndex].value);
      allValuesAtTime.sort((a, b) => a - b);

      const percentile10 = allValuesAtTime[Math.floor(allValuesAtTime.length * 0.1)];
      const percentile50 = allValuesAtTime[Math.floor(allValuesAtTime.length * 0.5)];
      const percentile90 = allValuesAtTime[Math.floor(allValuesAtTime.length * 0.9)];

      return {
        name: point.name,
        p10: percentile10,
        p50: percentile50, 
        p90: percentile90
      };
    });
  }, [simulationResults]);

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    return <NumericFormat value={value} displayType={'text'} thousandSeparator="," decimalScale={0} prefix="$" />;
  };

  const mainColor = 'var(--chart-line-color)';
  const p90Color = 'var(--success-color)';
  const p10Color = 'var(--warning-color)';

  return (
    <div className="monte-carlo-chart">
      <h3>Monte Carlo Simulation</h3>
      <p className="simulation-description">
        Showing possible outcomes based on {simulations} simulations using historical volatility.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={percentileData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" stroke="var(--text-color)" />
          <YAxis stroke="var(--text-color)" />
          <Tooltip formatter={(value: number) => formatTooltipValue(value)} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="p50" 
            stroke={mainColor} 
            name="Median Outcome" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="p90" 
            stroke={p90Color} 
            name="90th Percentile" 
            strokeWidth={1.5} 
            strokeDasharray="5 5" 
            dot={false} 
          />
          <Line 
            type="monotone" 
            dataKey="p10" 
            stroke={p10Color} 
            name="10th Percentile" 
            strokeWidth={1.5} 
            strokeDasharray="5 5" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonteCarlo; 