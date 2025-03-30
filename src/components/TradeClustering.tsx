import React, { useState, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface Trade {
  id: number;
  entryTime: string;
  exitTime: string;
  duration: number; // in days
  entryPrice: number;
  exitPrice: number;
  profit: number;
  profitPercent: number;
  volume: number;
}

interface TradeClusteringProps {
  trades: Trade[];
}

// Define types of clustering dimensions
type ClusterDimension = 'profitPercent' | 'duration' | 'volume' | 'entryPrice' | 'exitPrice' | 'time';

interface DimensionConfig {
  label: string;
  description: string;
  dataKey: string;
  formatter?: (value: number) => string;
}

const TradeClustering: React.FC<TradeClusteringProps> = ({ trades }) => {
  // State for selected dimensions to cluster on
  const [xDimension, setXDimension] = useState<ClusterDimension>('duration');
  const [yDimension, setYDimension] = useState<ClusterDimension>('profitPercent');
  const [clusterCount, setClusterCount] = useState<number>(3);

  // Configuration for dimensions
  const dimensions: Record<ClusterDimension, DimensionConfig> = {
    profitPercent: {
      label: 'Profit %',
      description: 'Percentage profit/loss for each trade',
      dataKey: 'profitPercent',
      formatter: (value: number) => `${(value * 100).toFixed(2)}%`
    },
    duration: {
      label: 'Duration',
      description: 'Trade duration in days',
      dataKey: 'duration',
      formatter: (value: number) => `${value.toFixed(1)} days`
    },
    volume: {
      label: 'Volume',
      description: 'Trade volume/size',
      dataKey: 'volume',
      formatter: (value: number) => value.toFixed(2)
    },
    entryPrice: {
      label: 'Entry Price',
      description: 'Price at trade entry',
      dataKey: 'entryPrice',
      formatter: (value: number) => `$${value.toFixed(2)}`
    },
    exitPrice: {
      label: 'Exit Price',
      description: 'Price at trade exit',
      dataKey: 'exitPrice',
      formatter: (value: number) => `$${value.toFixed(2)}`
    },
    time: {
      label: 'Time',
      description: 'Entry time (days from start)',
      dataKey: 'timeIndex',
      formatter: (value: number) => `Day ${value}`
    }
  };

  // Preprocess trades to add standardized time index
  const processedTrades = useMemo(() => {
    if (!trades.length) return [];
    
    // Add time index (days from first trade)
    const firstTradeDate = new Date(trades[0].entryTime).getTime();
    
    return trades.map(trade => ({
      ...trade,
      timeIndex: Math.floor((new Date(trade.entryTime).getTime() - firstTradeDate) / (1000 * 60 * 60 * 24))
    }));
  }, [trades]);

  // Perform K-means clustering
  const clusteredTrades = useMemo(() => {
    if (!processedTrades.length) return { clusters: [], centroids: [] };
    
    // Get values for selected dimensions
    const xValues = processedTrades.map(t => t[xDimension]);
    const yValues = processedTrades.map(t => t[yDimension]);
    
    // Normalize values
    const normalizeArray = (arr: number[]) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return arr.map(val => (max === min) ? 0.5 : (val - min) / (max - min));
    };
    
    const normalizedX = normalizeArray(xValues as number[]);
    const normalizedY = normalizeArray(yValues as number[]);
    
    // Initialize random centroids
    let centroids: [number, number][] = [];
    for (let i = 0; i < clusterCount; i++) {
      centroids.push([Math.random(), Math.random()]);
    }
    
    // Create points
    const points = normalizedX.map((x, i) => [x, normalizedY[i]]);
    
    // Run K-means algorithm (simplified)
    const maxIterations = 10;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign points to clusters
      const clusters: number[][] = Array(clusterCount).fill(0).map(() => []);
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        let minDist = Infinity;
        let closestCentroid = 0;
        
        for (let j = 0; j < centroids.length; j++) {
          const centroid = centroids[j];
          const dist = Math.sqrt(
            Math.pow(point[0] - centroid[0], 2) + 
            Math.pow(point[1] - centroid[1], 2)
          );
          
          if (dist < minDist) {
            minDist = dist;
            closestCentroid = j;
          }
        }
        
        clusters[closestCentroid].push(i);
      }
      
      // Update centroids
      const newCentroids: [number, number][] = [];
      
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        
        if (cluster.length === 0) {
          // Keep old centroid if cluster is empty
          newCentroids.push(centroids[i]);
          continue;
        }
        
        let sumX = 0, sumY = 0;
        for (const pointIdx of cluster) {
          sumX += points[pointIdx][0];
          sumY += points[pointIdx][1];
        }
        
        newCentroids.push([sumX / cluster.length, sumY / cluster.length]);
      }
      
      centroids = newCentroids;
    }
    
    // Assign clusters to trades
    const tradesClustered = processedTrades.map((trade, idx) => {
      // Find closest centroid
      const point = [normalizedX[idx], normalizedY[idx]];
      let minDist = Infinity;
      let cluster = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        const dist = Math.sqrt(
          Math.pow(point[0] - centroid[0], 2) + 
          Math.pow(point[1] - centroid[1], 2)
        );
        
        if (dist < minDist) {
          minDist = dist;
          cluster = i;
        }
      }
      
      return {
        ...trade,
        cluster
      };
    });
    
    // Convert normalized centroids back to original values
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    const originalCentroids = centroids.map(([x, y]) => ({
      [xDimension]: xMin + x * (xMax - xMin),
      [yDimension]: yMin + y * (yMax - yMin),
      cluster: centroids.indexOf([x, y])
    }));
    
    return {
      clusters: tradesClustered,
      centroids: originalCentroids
    };
  }, [processedTrades, xDimension, yDimension, clusterCount]);

  // Calculate cluster stats
  const clusterStats = useMemo(() => {
    if (!clusteredTrades.clusters.length) return [];
    
    const stats = [];
    for (let i = 0; i < clusterCount; i++) {
      const clusterTrades = clusteredTrades.clusters.filter(t => t.cluster === i);
      
      if (clusterTrades.length === 0) continue;
      
      const totalProfitPercent = clusterTrades.reduce((sum, t) => sum + t.profitPercent, 0);
      const avgProfitPercent = totalProfitPercent / clusterTrades.length;
      
      const avgDuration = clusterTrades.reduce((sum, t) => sum + t.duration, 0) / clusterTrades.length;
      
      const winningTrades = clusterTrades.filter(t => t.profitPercent > 0);
      const winRate = winningTrades.length / clusterTrades.length;
      
      stats.push({
        cluster: i,
        count: clusterTrades.length,
        avgProfitPercent,
        avgDuration,
        winRate,
        totalProfitPercent
      });
    }
    
    return stats;
  }, [clusteredTrades.clusters, clusterCount]);

  // Generate colors for clusters
  const clusterColors = useMemo(() => {
    const baseColors = [
      'rgb(59, 130, 246)',  // Blue
      'rgb(16, 185, 129)',  // Green
      'rgb(245, 158, 11)',  // Orange
      'rgb(236, 72, 153)',  // Pink
      'rgb(139, 92, 246)',  // Purple
      'rgb(239, 68, 68)',   // Red
      'rgb(20, 184, 166)',  // Teal
    ];
    
    return Array(clusterCount).fill(0).map((_, i) => 
      baseColors[i % baseColors.length]
    );
  }, [clusterCount]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const trade = payload[0].payload;
      return (
        <div className="cluster-tooltip">
          <p className="label">Trade #{trade.id}</p>
          <p>{`Entry: ${trade.entryTime}`}</p>
          <p>{`Exit: ${trade.exitTime}`}</p>
          <p>{`Duration: ${trade.duration.toFixed(1)} days`}</p>
          <p>{`Profit: ${(trade.profitPercent * 100).toFixed(2)}%`}</p>
          <p>{`Cluster: ${trade.cluster + 1}`}</p>
        </div>
      );
    }
    return null;
  };

  if (!trades || trades.length === 0) {
    return <div className="no-trades-message">No trade data available for clustering analysis.</div>;
  }

  return (
    <div className="trade-clustering">
      <h3>Trade Clustering Analysis</h3>
      <p className="clustering-description">
        Identifies patterns in trading behavior by grouping similar trades together.
      </p>

      <div className="clustering-controls">
        <div className="control-group">
          <label htmlFor="x-dimension">X Dimension:</label>
          <select 
            id="x-dimension" 
            value={xDimension} 
            onChange={(e) => setXDimension(e.target.value as ClusterDimension)}
          >
            {Object.entries(dimensions).map(([key, dim]) => (
              <option key={key} value={key}>{dim.label}</option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="y-dimension">Y Dimension:</label>
          <select 
            id="y-dimension" 
            value={yDimension} 
            onChange={(e) => setYDimension(e.target.value as ClusterDimension)}
          >
            {Object.entries(dimensions).map(([key, dim]) => (
              <option key={key} value={key}>{dim.label}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="cluster-count">Number of Clusters:</label>
          <select 
            id="cluster-count" 
            value={clusterCount} 
            onChange={(e) => setClusterCount(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="cluster-chart">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              type="number" 
              dataKey={dimensions[xDimension].dataKey} 
              name={dimensions[xDimension].label}
              stroke="var(--text-color)"
              label={{ 
                value: dimensions[xDimension].label, 
                position: 'insideBottom', 
                offset: -10 
              }} 
            />
            <YAxis 
              type="number" 
              dataKey={dimensions[yDimension].dataKey}
              name={dimensions[yDimension].label}
              stroke="var(--text-color)"
              label={{ 
                value: dimensions[yDimension].label, 
                angle: -90, 
                position: 'insideLeft' 
              }} 
            />
            <ZAxis 
              type="number" 
              dataKey="volume"
              range={[60, 400]} 
              name="Volume" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Clustered trades */}
            {Array.from({ length: clusterCount }).map((_, i) => (
              <Scatter 
                key={i} 
                name={`Cluster ${i + 1}`} 
                data={clusteredTrades.clusters.filter(t => t.cluster === i)} 
                fill={clusterColors[i]}
              />
            ))}
            
            {/* Centroids */}
            <Scatter 
              name="Centroids" 
              data={clusteredTrades.centroids} 
              shape="star" 
              fill="#000"
            >
              {clusteredTrades.centroids.map((centroid, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={clusterColors[centroid.cluster]} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="cluster-stats">
        <h4>Cluster Statistics</h4>
        <div className="stats-grid">
          <div className="stats-header">
            <span>Cluster</span>
            <span>Count</span>
            <span>Avg Profit %</span>
            <span>Win Rate</span>
            <span>Avg Duration</span>
          </div>
          {clusterStats.map((stat) => (
            <div 
              key={stat.cluster} 
              className="stats-row"
              style={{ 
                borderLeft: `4px solid ${clusterColors[stat.cluster]}`,
                backgroundColor: stat.avgProfitPercent > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              }}
            >
              <span>{stat.cluster + 1}</span>
              <span>{stat.count}</span>
              <span className={stat.avgProfitPercent > 0 ? 'positive' : 'negative'}>
                {(stat.avgProfitPercent * 100).toFixed(2)}%
              </span>
              <span>{(stat.winRate * 100).toFixed(0)}%</span>
              <span>{stat.avgDuration.toFixed(1)} days</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cluster-insights">
        <h4>Insights</h4>
        <ul>
          {clusterStats.length > 0 && (
            <>
              <li>
                <strong>Best Cluster:</strong> Cluster {clusterStats.reduce((best, stat) => 
                  stat.avgProfitPercent > clusterStats[best].avgProfitPercent ? stat.cluster : best, 0) + 1} 
                has the highest average profit at {(Math.max(...clusterStats.map(s => s.avgProfitPercent)) * 100).toFixed(2)}%.
              </li>
              <li>
                <strong>Worst Cluster:</strong> Cluster {clusterStats.reduce((worst, stat) => 
                  stat.avgProfitPercent < clusterStats[worst].avgProfitPercent ? stat.cluster : worst, 0) + 1} 
                has the lowest average profit at {(Math.min(...clusterStats.map(s => s.avgProfitPercent)) * 100).toFixed(2)}%.
              </li>
              <li>
                <strong>Most Common:</strong> Cluster {clusterStats.reduce((most, stat) => 
                  stat.count > clusterStats[most].count ? stat.cluster : most, 0) + 1} 
                contains the most trades ({Math.max(...clusterStats.map(s => s.count))}).
              </li>
            </>
          )}
          <li>
            <strong>Strategy Recommendation:</strong> Focus on trades similar to those in clusters with positive returns, 
            and avoid trade setups similar to clusters with negative returns.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TradeClustering; 