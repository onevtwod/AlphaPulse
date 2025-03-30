import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DrawdownPeriod {
  start: string;
  end: string;
  duration: number; // in days
  depth: number; // percentage as decimal (e.g., -0.15 for -15%)
  recovery: number; // in days (0 if not yet recovered)
}

interface DrawdownWaterfallProps {
  equityCurve: Array<{
    name: string;
    returns: number;
    drawdown?: number;
  }>;
  maxDrawdowns?: number; // Number of largest drawdowns to show
}

const DrawdownWaterfall: React.FC<DrawdownWaterfallProps> = ({ 
  equityCurve, 
  maxDrawdowns = 5 
}) => {
  // Process equity curve to identify drawdown periods
  const drawdownPeriods = useMemo(() => {
    if (!equityCurve || equityCurve.length === 0) return [];
    
    const periods: DrawdownPeriod[] = [];
    let inDrawdown = false;
    let currentMax = equityCurve[0].returns;
    let drawdownStart = '';
    let drawdownStartIndex = 0;
    let currentDrawdown = 0;
    
    // Scan through equity curve to identify drawdown periods
    for (let i = 1; i < equityCurve.length; i++) {
      const { name, returns } = equityCurve[i];
      
      // Update high water mark
      if (returns > currentMax) {
        currentMax = returns;
        // If we were in a drawdown and now reached a new high, the drawdown has ended
        if (inDrawdown) {
          periods.push({
            start: drawdownStart,
            end: equityCurve[i-1].name,
            duration: i - drawdownStartIndex,
            depth: currentDrawdown,
            recovery: i - drawdownStartIndex // For simplicity, same as duration in this case
          });
          inDrawdown = false;
          currentDrawdown = 0;
        }
      } else {
        // Calculate current drawdown
        const drawdown = (returns - currentMax) / currentMax;
        
        // If this is a new drawdown or a deeper drawdown in the current period
        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStart = name;
          drawdownStartIndex = i;
          currentDrawdown = drawdown;
        } else if (drawdown < currentDrawdown) {
          // Update the deepest drawdown in this period
          currentDrawdown = drawdown;
        }
      }
    }
    
    // If still in drawdown at the end of the data
    if (inDrawdown) {
      periods.push({
        start: drawdownStart,
        end: equityCurve[equityCurve.length - 1].name,
        duration: equityCurve.length - drawdownStartIndex,
        depth: currentDrawdown,
        recovery: 0 // Not yet recovered
      });
    }
    
    // Sort by depth (largest drawdowns first) and limit to maxDrawdowns
    return periods
      .sort((a, b) => a.depth - b.depth)
      .slice(0, maxDrawdowns);
  }, [equityCurve, maxDrawdowns]);

  // Format data for chart display
  const chartData = useMemo(() => {
    return drawdownPeriods.map((period, index) => ({
      id: index + 1,
      period: `${period.start} to ${period.end}`,
      depth: period.depth * 100, // Convert to percentage
      duration: period.duration,
      recovery: period.recovery
    }));
  }, [drawdownPeriods]);

  const formatTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="drawdown-tooltip">
          <p className="label">{`Drawdown #${payload[0].payload.id}`}</p>
          <p>{`Period: ${payload[0].payload.period}`}</p>
          <p>{`Depth: ${payload[0].payload.depth.toFixed(2)}%`}</p>
          <p>{`Duration: ${payload[0].payload.duration} days`}</p>
          {payload[0].payload.recovery ? 
            <p>{`Recovery: ${payload[0].payload.recovery} days`}</p> : 
            <p>Not yet recovered</p>
          }
        </div>
      );
    }
    return null;
  };

  return (
    <div className="drawdown-waterfall">
      <h3>Drawdown Waterfall</h3>
      <p className="drawdown-description">
        Showing the {maxDrawdowns} largest drawdown periods. Bars show the maximum percentage decline from peak.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="id" 
            label={{ 
              value: 'Drawdown Number', 
              position: 'insideBottom', 
              offset: -10 
            }}
            stroke="var(--text-color)"
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            label={{ 
              value: 'Maximum Drawdown (%)', 
              angle: -90, 
              position: 'insideLeft' 
            }}
            stroke="var(--text-color)"
          />
          <Tooltip content={formatTooltip} />
          <Legend />
          <ReferenceLine y={0} stroke="var(--text-light)" />
          <Bar 
            dataKey="depth" 
            fill="var(--danger-color)" 
            name="Drawdown %" 
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DrawdownWaterfall; 