import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { NumericFormat } from 'react-number-format';

// Parameter configuration type
interface ParameterConfig {
  rollingWindow: number;
  zScore: number;
  returnPercent: number;
  drawdown: number;
  sharpeRatio: number;
}

interface RiskRewardMapProps {
  parameters: ParameterConfig[];
}

const RiskRewardMap: React.FC<RiskRewardMapProps> = ({ parameters }) => {
  // Transform data for the scatter plot
  const scatterData = React.useMemo(() => {
    return parameters.map(param => ({
      x: Math.abs(param.drawdown), // Risk (use absolute value of drawdown)
      y: param.returnPercent,      // Reward
      z: param.sharpeRatio,        // Size based on Sharpe Ratio
      name: `${param.rollingWindow}-day / ${param.zScore} Z`,
      config: param
    }));
  }, [parameters]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="risk-reward-tooltip">
          <p className="label">{data.name}</p>
          <p>Return: {(data.y * 100).toFixed(1)}%</p>
          <p>Drawdown: {(data.x * 100).toFixed(1)}%</p>
          <p>Sharpe: {data.z.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="risk-reward-map">
      <h3>Risk-Reward Analysis</h3>
      <p className="risk-reward-description">
        Each point represents a parameter configuration. 
        X-axis: Risk (Drawdown), Y-axis: Return, Size: Sharpe Ratio
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Risk" 
            label={{ value: 'Risk (Drawdown %)', position: 'insideBottom', offset: -10 }} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={[0, 'dataMax']}
            stroke="var(--text-color)"
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Return" 
            label={{ value: 'Return %', angle: -90, position: 'insideLeft' }} 
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={[0, 'dataMax']}
            stroke="var(--text-color)"
          />
          <ZAxis 
            type="number" 
            dataKey="z" 
            range={[50, 350]} 
            name="Sharpe" 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter 
            name="Parameter Configurations" 
            data={scatterData} 
            fill="var(--chart-line-color)" 
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskRewardMap; 