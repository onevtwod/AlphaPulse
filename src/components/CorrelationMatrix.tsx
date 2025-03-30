import React from 'react';

interface CorrelationMatrixProps {
  assetData: {
    name: string;
    returns: number[];
  }[];
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ assetData }) => {
  // Calculate correlation between two time series
  const calculateCorrelation = (a: number[], b: number[]): number => {
    if (a.length !== b.length || a.length === 0) {
      return 0;
    }
    
    // Calculate means
    const meanA = a.reduce((sum, val) => sum + val, 0) / a.length;
    const meanB = b.reduce((sum, val) => sum + val, 0) / b.length;
    
    // Calculate covariance and variances
    let covariance = 0;
    let varianceA = 0;
    let varianceB = 0;
    
    for (let i = 0; i < a.length; i++) {
      const diffA = a[i] - meanA;
      const diffB = b[i] - meanB;
      covariance += diffA * diffB;
      varianceA += diffA * diffA;
      varianceB += diffB * diffB;
    }
    
    // Prevent division by zero
    if (varianceA === 0 || varianceB === 0) {
      return 0;
    }
    
    return covariance / Math.sqrt(varianceA * varianceB);
  };
  
  // Calculate all correlations
  const correlations = React.useMemo(() => {
    const result: number[][] = [];
    
    for (let i = 0; i < assetData.length; i++) {
      result[i] = [];
      for (let j = 0; j < assetData.length; j++) {
        result[i][j] = calculateCorrelation(assetData[i].returns, assetData[j].returns);
      }
    }
    
    return result;
  }, [assetData]);
  
  // Get color for correlation value
  const getCorrelationColor = (value: number): string => {
    // Strong positive correlation (red)
    if (value >= 0.8) return 'rgba(220, 53, 69, 0.9)';
    // Medium positive correlation (light red)
    if (value >= 0.5) return 'rgba(220, 53, 69, 0.6)';
    // Weak positive correlation (pink)
    if (value >= 0.2) return 'rgba(220, 53, 69, 0.3)';
    // No correlation (white/gray)
    if (value >= -0.2) return 'rgba(200, 200, 200, 0.3)';
    // Weak negative correlation (light blue)
    if (value >= -0.5) return 'rgba(13, 110, 253, 0.3)';
    // Medium negative correlation (blue)
    if (value >= -0.8) return 'rgba(13, 110, 253, 0.6)';
    // Strong negative correlation (dark blue)
    return 'rgba(13, 110, 253, 0.9)';
  };
  
  return (
    <div className="correlation-matrix">
      <h3>Asset Correlation</h3>
      <p className="correlation-description">
        Correlation between assets based on historical returns. 
        Red = positive correlation, Blue = negative correlation.
      </p>
      <div className="correlation-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: `auto ${assetData.map(() => '1fr').join(' ')}`,
        gridTemplateRows: `auto ${assetData.map(() => 'auto').join(' ')}`,
      }}>
        {/* Empty corner cell */}
        <div className="correlation-empty-cell"></div>
        
        {/* Column headers */}
        {assetData.map((asset, index) => (
          <div key={`col-${asset.name}`} className="correlation-header">
            {asset.name}
          </div>
        ))}
        
        {/* Rows */}
        {assetData.map((rowAsset, rowIndex) => (
          <React.Fragment key={`row-${rowAsset.name}`}>
            {/* Row header */}
            <div className="correlation-header row-header">
              {rowAsset.name}
            </div>
            
            {/* Correlation values */}
            {assetData.map((colAsset, colIndex) => (
              <div 
                key={`cell-${rowAsset.name}-${colAsset.name}`} 
                className="correlation-cell"
                style={{ backgroundColor: getCorrelationColor(correlations[rowIndex][colIndex]) }}
                title={`${rowAsset.name} to ${colAsset.name}: ${correlations[rowIndex][colIndex].toFixed(2)}`}
              >
                {correlations[rowIndex][colIndex].toFixed(2)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CorrelationMatrix; 