import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, ReferenceLine
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaChartArea, FaFilter, FaDownload, FaCog, FaInfoCircle, FaChartBar, FaChartLine, FaChartPie, FaRandom, FaUpload, FaCalendarAlt, FaTable, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { extractTrades, calculateMetrics, PerformanceDataObject, ProcessedDataObject } from './utils/dataProcessing';
import ReactDOM from 'react-dom';

// Sample JSON structure for reference
const sampleJsonFormat = {
  candle_topics: ["binance:btcusdt"],
  initial_capital: 10000,
  trades: {
    "rsi_oversold=30": "{\"trades\":{\"BTCUSDT\":[{\"quantity\":\"0.01\",\"side\":\"buy\",\"price\":\"20000\",\"time\":1641000000000},{\"quantity\":\"0.01\",\"side\":\"sell\",\"price\":\"21000\",\"time\":1642000000000}]}}"
  }
};

// Default performance data
const defaultPerformanceData: PerformanceDataObject = {
  candle_topics: ["binance:btcusdt"],
  initial_capital: 10000,
  trades: {
    "rsi_oversold=30": "{\"trades\":{\"BTCUSDT\":[{\"quantity\":\"0.01\",\"side\":\"buy\",\"price\":\"20000\",\"time\":1641000000000},{\"quantity\":\"0.01\",\"side\":\"sell\",\"price\":\"21000\",\"time\":1642000000000},{\"quantity\":\"0.02\",\"side\":\"buy\",\"price\":\"20500\",\"time\":1643000000000},{\"quantity\":\"0.02\",\"side\":\"sell\",\"price\":\"19500\",\"time\":1644000000000},{\"quantity\":\"0.015\",\"side\":\"buy\",\"price\":\"19000\",\"time\":1645000000000},{\"quantity\":\"0.015\",\"side\":\"sell\",\"price\":\"20500\",\"time\":1646000000000}]}}"
  }
};

// Process the default data with error handling and logging
const processedData = (() => {
  try {
    console.log('Processing default data...');
    const trades = extractTrades(defaultPerformanceData);
    const metrics = calculateMetrics(trades, defaultPerformanceData.initial_capital, defaultPerformanceData);
    console.log('Default data processed successfully', metrics);
    return metrics;
  } catch (error) {
    console.error('Error processing default data:', error);
    // Return a minimal valid object to prevent rendering errors
    return {
      strategyName: "Sample Strategy",
      strategyParams: "Default",
      initialCapital: 10000,
      totalReturn: 0.25,
      annualReturn: 0.15,
      sharpeRatio: 1.2,
      maxDrawdown: 0.1,
      avgProfit: 100,
      winRate: 0.6,
      profitFactor: 1.5,
      winLossRatio: 1.2,
      trades: [],
      equityCurve: [
        {date: "2023-01-01", value: 10000},
        {date: "2023-02-01", value: 10500},
        {date: "2023-03-01", value: 11000},
        {date: "2023-04-01", value: 10800},
        {date: "2023-05-01", value: 11500},
        {date: "2023-06-01", value: 12000}
      ],
      monthlyReturns: [
        {month: "Jan 2023", return: 0.05},
        {month: "Feb 2023", return: 0.048},
        {month: "Mar 2023", return: -0.018},
        {month: "Apr 2023", return: 0.065},
        {month: "May 2023", return: 0.043}
      ],
      drawdowns: [
        {name: "DD1", value: -0.03},
        {name: "DD2", value: -0.05},
        {name: "DD3", value: -0.02}
      ],
      tradeClusters: [
        {x: 3, y: 0.02, z: 1000, cluster: 0},
        {x: 5, y: 0.04, z: 1500, cluster: 0},
        {x: 2, y: -0.01, z: 800, cluster: 1},
        {x: 7, y: 0.03, z: 1200, cluster: 2}
      ]
    };
  }
})();

// Mock components and new modal component for sample format
const FormatModal: React.FC<{ isOpen: boolean; onClose: () => void; onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ isOpen, onClose, onFileUpload }) => {
  if (!isOpen) return null;
  
  // Create a file input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Trigger file dialog when button is clicked
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Sample JSON to display
  const sampleJson = `{
  "candle_topics": ["candles-1h-BTC/USDT-bybit"],
  "initial_capital": 2111.0,
  "trades": {
    "rolling_window=330,multiplier=0.14": "{
      \\"trades\\":{
        \\"BTCUSDT\\":[
          {\\"quantity\\":\\"0.001\\",\\"side\\":\\"sell\\",\\"price\\":\\"8766\\",\\"time\\":1589155200000},
          {\\"quantity\\":\\"0.001\\",\\"side\\":\\"buy\\",\\"price\\":\\"8862\\",\\"time\\":1589198400000},
          {\\"quantity\\":\\"0.001\\",\\"side\\":\\"buy\\",\\"price\\":\\"8862\\",\\"time\\":1589198400000},
          {\\"quantity\\":\\"0.001\\",\\"side\\":\\"sell\\",\\"price\\":\\"8865\\",\\"time\\":1589205600000},
          {\\"quantity\\":\\"0.001\\",\\"side\\":\\"sell\\",\\"price\\":\\"8865\\",\\"time\\":1589205600000}
          // ... more trades
        ]
      }
    }"
  }
}`;
  
  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '95%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #e2e8f0'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '15px',
        }}>
          <h2 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            margin: 0, 
            color: '#1e40af',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            <FaInfoCircle style={{ color: '#3b82f6' }} /> JSON Format Instructions
          </h2>
          <button 
            className="close-button" 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
              border: 'none',
              fontSize: '18px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#334155';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >×</button>
        </div>
        
        <div className="modal-body">
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#475569',
            marginBottom: '20px'
          }}>
            Please upload your trading strategy performance data in JSON format according to this structure:
          </p>
          
          {/* Sample JSON format display */}
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '25px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto'
          }}>
            <pre style={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#334155',
              textAlign: 'left'
            }}>
              {sampleJson}
            </pre>
          </div>
          
          {/* Hidden file input is still present for functionality */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onFileUpload}
            style={{
              display: 'none', // Hide the input
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PerformanceDashboard: React.FC = () => {
  console.log('Rendering PerformanceDashboard...');
  const [activeTab, setActiveTab] = useState('overview');
  const [isFormatModalOpen, setFormatModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState<ProcessedDataObject | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string | null, end: string | null}>({start: null, end: null});
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tradesPage, setTradesPage] = useState(1);
  const [tradesPerPage] = useState(15);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending'|'descending'}>({key: 'time', direction: 'descending'});
  const dashboardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Don't automatically use processed default data - only use uploaded data
  const data = uploadedData;
  
  // Get min and max dates from data for date filter
  const dateExtents = useMemo(() => {
    if (!data?.equityCurve || data.equityCurve.length === 0) {
      return { min: null, max: null };
    }
    
    const dates = data.equityCurve.map(item => item.date);
    return {
      min: dates[0],
      max: dates[dates.length - 1]
    };
  }, [data]);
  
  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!dateRange.start && !dateRange.end) return data;
    
    // Create a deep copy of the data
    const filtered = { ...data };
    
    // Filter equity curve
    if (filtered.equityCurve) {
      filtered.equityCurve = filtered.equityCurve.filter(point => {
        const date = point.date;
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter monthly returns
    if (filtered.monthlyReturns) {
      filtered.monthlyReturns = filtered.monthlyReturns.filter(point => {
        // Extract year and month from "Jan 2023" format
        const parts = point.month.split(' ');
        if (parts.length !== 2) return true;
        
        const month = parts[0];
        const year = parts[1];
        const monthNum = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month) + 1;
        const dateStr = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
        
        if (dateRange.start && dateStr < dateRange.start) return false;
        if (dateRange.end && dateStr > dateRange.end) return false;
        return true;
      });
    }
    
    // Recalculate some metrics based on filtered data if needed
    return filtered;
  }, [data, dateRange]);
  
  // Memoize chart data to prevent unnecessary re-renders
  const memoizedChartData = useMemo(() => {
    if (!filteredData) return null;
    
    return {
      equityCurve: filteredData.equityCurve,
      monthlyReturns: filteredData.monthlyReturns,
      drawdowns: filteredData.drawdowns,
      tradeClusters: filteredData.tradeClusters
    };
  }, [filteredData]);
  
  // Date filter component
  const DateRangeFilter = () => {
    if (!showDateFilter) return null;
    
    return (
      <div className="date-filter-panel" style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '16px',
        zIndex: 100,
        width: '300px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaCalendarAlt /> Filter by Date Range
        </h3>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '12px', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            Start Date
          </label>
          <input 
            type="date" 
            value={dateRange.start || ''} 
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value || null }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px'
            }}
            min={dateExtents.min || undefined}
            max={dateExtents.max || undefined}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '12px', 
            color: '#64748b',
            fontWeight: '500'
          }}>
            End Date
          </label>
          <input 
            type="date" 
            value={dateRange.end || ''} 
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value || null }))}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px'
            }}
            min={dateExtents.min || undefined}
            max={dateExtents.max || undefined}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setDateRange({ start: null, end: null });
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Reset
          </button>
          <button
            onClick={() => setShowDateFilter(false)}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Apply
          </button>
        </div>
      </div>
    );
  };
  
  // Handle direct file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Load sample data function
  const loadSampleData = () => {
    try {
      const trades = extractTrades(defaultPerformanceData);
      const processedData = calculateMetrics(trades, defaultPerformanceData.initial_capital, defaultPerformanceData);
      setUploadedData(processedData);
    } catch (error) {
      console.error('Error loading sample data:', error);
      alert('Unable to load sample data. Please try uploading your own data.');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller file.');
      return;
    }

    // Show loading state
    setExportStatus('Loading data...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log("Reading uploaded file...");
        const content = e.target?.result as string;
        
        // Parse the JSON content
        const jsonData = JSON.parse(content) as PerformanceDataObject;
        
        // Validate the JSON structure
        if (!jsonData.initial_capital) {
          throw new Error("Missing required field: initial_capital");
        }
        
        if (!jsonData.trades || Object.keys(jsonData.trades).length === 0) {
          throw new Error("Missing required field: trades");
        }
        
        // Process the uploaded data
        console.log("Extracting trades...");
        const trades = extractTrades(jsonData);
        console.log("Extracted trades:", trades.length);
        
        if (trades.length === 0) {
          throw new Error("No valid trades found in the uploaded data");
        }
        
        if (trades.length % 2 !== 0) {
          console.warn("Warning: Odd number of trades detected. Some trades may be incomplete.");
        }
        
        console.log("Calculating metrics...");
        const processedData = calculateMetrics(trades, jsonData.initial_capital, jsonData);
        console.log("Metrics calculated successfully");
        
        setUploadedData(processedData);
        setFormatModalOpen(false);
        setExportStatus('Data loaded successfully!');
        
        // Clear status after 2 seconds
        setTimeout(() => setExportStatus(null), 2000);
      } catch (error) {
        console.error('Error processing JSON:', error);
        setExportStatus(null);
        
        // Provide more specific error messages based on the error type
        if (error instanceof SyntaxError) {
          alert('Invalid JSON format. Please check that your file contains valid JSON.');
        } else if (error instanceof Error) {
          alert(`Error processing data: ${error.message}. Please check your file and try again.`);
        } else {
          alert('Unknown error while processing file. Please try again with a different file.');
        }
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setExportStatus(null);
      alert('Error reading file. Please try again or use a different file.');
    };
    reader.readAsText(file);
  };

  // Export PDF function
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      setExportStatus('Generating PDF...');
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10; // margin in mm
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246); // #3b82f6 blue
      pdf.text('AlphaPulse Performance Report', margin, margin + 10);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // #64748b slate
      const dateStr = new Date().toLocaleDateString();
      pdf.text(`Generated: ${dateStr}`, margin, margin + 18);
      
      // Add strategy metadata 
      pdf.setFontSize(12);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Strategy Summary:', margin, margin + 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      let yPos = margin + 36;
      pdf.text(`Strategy: ${data?.strategyName || 'Custom Strategy'}`, margin, yPos);
      yPos += 6;
      pdf.text(`Initial Capital: $${data?.initialCapital?.toFixed(2) || '0.00'}`, margin, yPos);
      yPos += 6;
      pdf.text(`Total Return: ${((data?.totalReturn || 0) * 100).toFixed(2)}%`, margin, yPos);
      yPos += 6;
      pdf.text(`Sharpe Ratio: ${data?.sharpeRatio?.toFixed(2) || '0.00'}`, margin, yPos);
      yPos += 6;
      pdf.text(`Win Rate: ${((data?.winRate || 0) * 100).toFixed(2)}%`, margin, yPos);
      yPos += 6;
      pdf.text(`Max Drawdown: ${((data?.maxDrawdown || 0) * 100).toFixed(2)}%`, margin, yPos);
      yPos += 15;
      
      // Create temporary divs to render all charts
      const chartContainers = document.createElement('div');
      chartContainers.style.position = 'absolute';
      chartContainers.style.left = '-9999px';
      document.body.appendChild(chartContainers);
      
      // Render Equity Curve chart
      const equityChartDiv = document.createElement('div');
      equityChartDiv.style.width = '900px';
      equityChartDiv.style.height = '400px';
      chartContainers.appendChild(equityChartDiv);
      
      const renderEquityChart = () => {
        return new Promise<HTMLCanvasElement>((resolve) => {
          const chart = (
            <div style={{ width: '100%', height: '100%', background: 'white', padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#334155' }}>Equity Curve</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={memoizedChartData?.equityCurve} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    tickFormatter={(value) => {
                      return value.substr(0, 4);
                    }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Equity']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Equity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="none" 
                    fillOpacity={0.6} 
                    fill="#3b82f6" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
          
          ReactDOM.render(chart, equityChartDiv, async () => {
            // Give chart time to render
            setTimeout(async () => {
              const canvas = await html2canvas(equityChartDiv, {
                scale: 2,
                useCORS: true,
                logging: false
              });
              resolve(canvas);
            }, 500);
          });
        });
      };
      
      // Render Monthly Returns chart
      const monthlyChartDiv = document.createElement('div');
      monthlyChartDiv.style.width = '900px';
      monthlyChartDiv.style.height = '400px';
      chartContainers.appendChild(monthlyChartDiv);
      
      const renderMonthlyChart = () => {
        return new Promise<HTMLCanvasElement>((resolve) => {
          const chart = (
            <div style={{ width: '100%', height: '100%', background: 'white', padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#334155' }}>Monthly Returns</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={memoizedChartData?.monthlyReturns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Monthly Return']} />
                  <Legend />
                  <ReferenceLine y={0} stroke="#94a3b8" />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="return" 
                    name="Monthly Return" 
                    radius={[4, 4, 0, 0]}
                  >
                    {memoizedChartData?.monthlyReturns.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.return >= 0 ? "url(#greenGradient)" : "url(#redGradient)"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
          
          ReactDOM.render(chart, monthlyChartDiv, async () => {
            // Give chart time to render
            setTimeout(async () => {
              const canvas = await html2canvas(monthlyChartDiv, {
                scale: 2,
                useCORS: true,
                logging: false
              });
              resolve(canvas);
            }, 500);
          });
        });
      };
      
      // Render Drawdown chart
      const drawdownChartDiv = document.createElement('div');
      drawdownChartDiv.style.width = '900px';
      drawdownChartDiv.style.height = '400px';
      chartContainers.appendChild(drawdownChartDiv);
      
      const renderDrawdownChart = () => {
        return new Promise<HTMLCanvasElement>((resolve) => {
          const chart = (
            <div style={{ width: '100%', height: '100%', background: 'white', padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#334155' }}>Drawdown Analysis</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={memoizedChartData?.drawdowns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip 
                    formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Drawdown']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#334155', fontWeight: '500' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '2px' }}
                    formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                  />
                  <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    dataKey="value" 
                    name="Drawdown" 
                    fill="url(#drawdownGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
          
          ReactDOM.render(chart, drawdownChartDiv, async () => {
            // Give chart time to render
            setTimeout(async () => {
              const canvas = await html2canvas(drawdownChartDiv, {
                scale: 2,
                useCORS: true,
                logging: false
              });
              resolve(canvas);
            }, 500);
          });
        });
      };
      
      // Render Trade Clustering chart
      const clusterChartDiv = document.createElement('div');
      clusterChartDiv.style.width = '900px';
      clusterChartDiv.style.height = '400px';
      chartContainers.appendChild(clusterChartDiv);
      
      const renderClusterChart = () => {
        return new Promise<HTMLCanvasElement>((resolve) => {
          const chart = (
            <div style={{ width: '100%', height: '100%', background: 'white', padding: '20px' }}>
              <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#334155' }}>Trade Clustering</h2>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Duration (days)" 
                    unit=" days"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Return" 
                    unit="%" 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 300]} name="Size" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    formatter={(value, name) => {
                      if (name === "Return") return [`${(Number(value) * 100).toFixed(2)}%`, name];
                      if (name === "Size") return [`$${value}`, name];
                      return [value, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#334155', fontWeight: '500' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '2px' }}
                    formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                  />
                  <Scatter 
                    name="Trades" 
                    data={memoizedChartData?.tradeClusters} 
                    fill="#8884d8"
                  >
                    {memoizedChartData?.tradeClusters.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.cluster === 0 ? "#10b981" : entry.cluster === 1 ? "#ef4444" : "#f59e0b"} 
                        stroke={entry.cluster === 0 ? "#059669" : entry.cluster === 1 ? "#dc2626" : "#d97706"}
                        strokeWidth={1}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          );
          
          ReactDOM.render(chart, clusterChartDiv, async () => {
            // Give chart time to render
            setTimeout(async () => {
              const canvas = await html2canvas(clusterChartDiv, {
                scale: 2,
                useCORS: true,
                logging: false
              });
              resolve(canvas);
            }, 500);
          });
        });
      };
      
      // Render all charts and add to PDF
      try {
        // Add equity curve chart
        const equityCanvas = await renderEquityChart();
        const equityImgData = equityCanvas.toDataURL('image/jpeg', 1.0);
        const equityImgWidth = contentWidth;
        const equityImgHeight = (equityCanvas.height * equityImgWidth) / equityCanvas.width;
        pdf.addImage(equityImgData, 'JPEG', margin, yPos, equityImgWidth, equityImgHeight);
        
        // Add monthly returns chart (on new page)
        pdf.addPage();
        const monthlyCanvas = await renderMonthlyChart();
        const monthlyImgData = monthlyCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(monthlyImgData, 'JPEG', margin, margin + 10, contentWidth, (monthlyCanvas.height * contentWidth) / monthlyCanvas.width);
        
        // Add drawdown chart (on new page)
        pdf.addPage();
        const drawdownCanvas = await renderDrawdownChart();
        const drawdownImgData = drawdownCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(drawdownImgData, 'JPEG', margin, margin + 10, contentWidth, (drawdownCanvas.height * contentWidth) / drawdownCanvas.width);
        
        // Add clustering chart (on new page)
        pdf.addPage();
        const clusterCanvas = await renderClusterChart();
        const clusterImgData = clusterCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(clusterImgData, 'JPEG', margin, margin + 10, contentWidth, (clusterCanvas.height * contentWidth) / clusterCanvas.width);
      } finally {
        // Clean up the temporary DOM elements
        document.body.removeChild(chartContainers);
      }
      
      // Add page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
      
      pdf.save(`AlphaPulse_Dashboard_${new Date().toISOString().slice(0,10)}.pdf`);
      
      setExportStatus('PDF generated successfully!');
      
      // Clear status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportStatus('Error generating PDF');
      
      // Clear error status after 3 seconds
      setTimeout(() => setExportStatus(null), 3000);
    }
  };
  
  // Resize handler with debounce
  const debounce = (fn: Function, ms = 300) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function(this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Handle window resize to adjust dashboard layout
  useEffect(() => {
    if (!data) return;
    
    const handleResize = debounce(() => {
      if (dashboardRef.current) {
        // Adjust chart dimensions or layout based on window size
        console.log('Window resized, adjusting dashboard layout');
      }
    }, 250);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);
  
  // Trades table sorting and pagination
  const sortedTrades = useMemo(() => {
    if (!filteredData?.trades) return [];
    
    const sortableTrades = [...filteredData.trades];
    
    // Sort based on current config
    return sortableTrades.sort((a, b) => {
      if (sortConfig.key === 'time') {
        // Use date property which is available in ProcessedTrade
        return sortConfig.direction === 'ascending' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      if (sortConfig.key === 'price') {
        // price is a number in ProcessedTrade, no need for parseFloat
        return sortConfig.direction === 'ascending' 
          ? a.price - b.price
          : b.price - a.price;
      }
      
      if (sortConfig.key === 'quantity') {
        // Use size property which corresponds to quantity
        return sortConfig.direction === 'ascending' 
          ? a.size - b.size
          : b.size - a.size;
      }
      
      if (sortConfig.key === 'side') {
        // Use type property which corresponds to buy/sell side
        if (a.type === b.type) return 0;
        return sortConfig.direction === 'ascending' 
          ? a.type.localeCompare(b.type)
          : b.type.localeCompare(a.type);
      }
      
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // Get the current page of trades for the table
  const currentTrades = useMemo(() => {
    const indexOfLastTrade = tradesPage * tradesPerPage;
    const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
    return sortedTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  }, [sortedTrades, tradesPage, tradesPerPage]);
  
  // Total number of pages for pagination
  const totalPages = useMemo(() => {
    return Math.ceil((sortedTrades?.length || 0) / tradesPerPage);
  }, [sortedTrades, tradesPerPage]);
  
  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon component based on current sort state
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <FaSort color="#cbd5e1" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp color="#3b82f6" /> : <FaSortDown color="#3b82f6" />;
  };
  
  // If no data has been uploaded yet, show only the upload interface
  if (!data) {
    return (
      <div className="upload-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        color: '#334155'
      }}>
        <h1 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '2.5rem',
          marginBottom: '1.5rem',
          color: '#1e40af',
          gap: '15px'
        }}>
          <FaChartArea style={{ color: '#3b82f6' }} /> 
          AlphaPulse Dashboard
        </h1>
        
        <p style={{ 
          fontSize: '18px', 
          maxWidth: '700px', 
          margin: '0 0 60px',
          lineHeight: '1.6',
          color: '#475569'
        }}>
          Upload your trading strategy performance data to visualize key metrics and gain valuable insights.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '40px',
          width: '100%',
          maxWidth: '1000px',
          alignItems: 'stretch',
          marginBottom: '60px',
        }}>
          {/* Upload card */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <FaUpload style={{ 
              fontSize: '48px', 
              color: '#3b82f6', 
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f0f9ff',
              borderRadius: '50%'
            }} />
            
            <h3 style={{ 
              marginBottom: '15px', 
              color: '#1e40af',
              fontWeight: '600',
              fontSize: '1.25rem'
            }}>
              Upload Your Data File
            </h3>
            
            <p style={{ 
              marginBottom: '30px', 
              color: '#64748b',
              maxWidth: '400px'
            }}>
              Select a JSON file containing your trading performance data to visualize your strategy results
            </p>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{
                  display: 'none', // Hide the default input
                }}
              />
              
              {/* Upload button - directly triggers file dialog */}
              <button 
                onClick={triggerFileUpload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '15px 30px',
                  fontSize: '16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  width: '100%',
                  maxWidth: '250px'
                }}
              >
                <FaUpload /> Upload Data
              </button>
            </div>
          </div>
          
          {/* Info card */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              marginBottom: '20px', 
              color: '#1e40af',
              fontWeight: '600',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaInfoCircle style={{ color: '#3b82f6' }} /> JSON Format Requirements
            </h3>
            
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              width: '100%',
              border: '1px solid #e2e8f0'
            }}>
              <ul style={{ 
                paddingLeft: '20px', 
                margin: 0, 
                color: '#475569',
                lineHeight: '1.6'
              }}>
                <li>File must be valid JSON</li>
                <li>Must include <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', color: '#334155' }}>initial_capital</code> and <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', color: '#334155' }}>trades</code> fields</li>
                <li>Trades should be in chronological order</li>
                <li>Each trade needs quantity, side, price, and time properties</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', width: '100%' }}>
              <button 
                onClick={() => setFormatModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  flex: '1'
                }}
              >
                <FaInfoCircle /> View Sample Format
              </button>
              
              <button 
                onClick={loadSampleData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  backgroundColor: '#f0f9ff',
                  color: '#3b82f6',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  flex: '1'
                }}
              >
                <FaChartBar /> Use Sample Data
              </button>
            </div>
          </div>
        </div>
        
        {isFormatModalOpen && (
          <FormatModal 
            isOpen={isFormatModalOpen} 
            onClose={() => setFormatModalOpen(false)} 
            onFileUpload={handleFileUpload}
          />
        )}
      </div>
    );
  }

  // If there is data (file was uploaded), show the full dashboard
  return (
    <div className="performance-dashboard" 
      ref={dashboardRef}
      style={{ 
        backgroundColor: '#f8fafc', 
        padding: '30px', 
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
    }}>
      {/* Dashboard content with data */}
      {exportStatus && (
        <div className="export-status-message" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {exportStatus}
        </div>
      )}

      <div className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px 30px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          margin: 0,
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1e40af'
        }}>
          <FaChartArea style={{ color: '#3b82f6' }} /> 
          AlphaPulse Dashboard
        </h1>
        <div className="dashboard-actions" style={{
          display: 'flex',
          gap: '12px',
          position: 'relative'
        }}>
          <button className="dashboard-button" 
            onClick={() => setShowDateFilter(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showDateFilter ? '#bfdbfe' : 'white',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <FaFilter /> Filter
          </button>
          <DateRangeFilter />
          <button className="dashboard-button" 
            onClick={() => setFormatModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <FaUpload /> Upload Data
          </button>
          <button className="dashboard-button" 
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'white',
              color: '#3b82f6',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: 'none',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f9ff';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label="Export dashboard as PDF"
            title="Export dashboard as PDF"
          >
            <FaDownload /> Export PDF
          </button>
        </div>
      </div>

      <div className="dashboard-overview" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="metric-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '100%',
            backgroundColor: filteredData?.totalReturn !== undefined && filteredData.totalReturn >= 0 ? '#10b981' : '#ef4444'
          }}></div>
          <h3 style={{ 
            fontSize: '0.9rem', 
            color: '#64748b', 
            marginTop: 0,
            marginBottom: '8px',
            fontWeight: '500',
            paddingLeft: '15px'
          }}>Total Return</h3>
          <p className={filteredData?.totalReturn !== undefined && filteredData.totalReturn >= 0 ? "positive" : "negative"} style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            margin: 0,
            color: filteredData?.totalReturn !== undefined && filteredData.totalReturn >= 0 ? '#10b981' : '#ef4444',
            paddingLeft: '15px'
          }}>
            {filteredData?.totalReturn !== undefined ? (filteredData.totalReturn * 100).toFixed(2) : '0.00'}%
          </p>
        </div>
        <div className="metric-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '100%',
            backgroundColor: filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 1 ? '#10b981' : filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 0 ? '#f59e0b' : '#ef4444'
          }}></div>
          <h3 style={{ 
            fontSize: '0.9rem', 
            color: '#64748b', 
            marginTop: 0,
            marginBottom: '8px',
            fontWeight: '500',
            paddingLeft: '15px'
          }}>Sharpe Ratio</h3>
          <p className={filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 1 ? "positive" : "neutral"} style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            margin: 0,
            color: filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 1 ? '#10b981' : filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 0 ? '#f59e0b' : '#ef4444',
            paddingLeft: '15px'
          }}>
            {filteredData?.sharpeRatio !== undefined ? filteredData.sharpeRatio.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="metric-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '100%',
            backgroundColor: filteredData?.winRate !== undefined && filteredData.winRate >= 0.5 ? '#10b981' : '#f59e0b'
          }}></div>
          <h3 style={{ 
            fontSize: '0.9rem', 
            color: '#64748b', 
            marginTop: 0,
            marginBottom: '8px',
            fontWeight: '500',
            paddingLeft: '15px'
          }}>Win Rate</h3>
          <p className={filteredData?.winRate !== undefined && filteredData.winRate >= 0.5 ? "positive" : "neutral"} style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            margin: 0,
            color: filteredData?.winRate !== undefined && filteredData.winRate >= 0.5 ? '#10b981' : '#f59e0b',
            paddingLeft: '15px'
          }}>
            {filteredData?.winRate !== undefined ? (filteredData.winRate * 100).toFixed(2) : '0.00'}%
          </p>
        </div>

        <div className="metric-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '5px',
            height: '100%',
            backgroundColor: '#6366f1'
          }}></div>
          <h3 style={{ 
            fontSize: '0.9rem', 
            color: '#64748b', 
            marginTop: 0,
            marginBottom: '8px',
            fontWeight: '500',
            paddingLeft: '15px'
          }}>Max Drawdown</h3>
          <p style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            margin: 0,
            color: '#64748b',
            paddingLeft: '15px'
          }}>
            {filteredData?.maxDrawdown !== undefined ? (filteredData.maxDrawdown * 100).toFixed(2) : '0.00'}%
          </p>
        </div>
      </div>

      <div className="risk-metrics-section" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#334155',
          marginTop: 0,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaCog style={{ color: '#3b82f6' }} /> Risk & Performance Metrics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Annual Return</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: filteredData?.annualReturn !== undefined && filteredData.annualReturn > 0 ? '#10b981' : '#ef4444',
            }}>
              {filteredData?.annualReturn !== undefined ? (filteredData.annualReturn * 100).toFixed(2) : '0.00'}%
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Annualized performance
            </small>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Profit Factor</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: filteredData?.profitFactor !== undefined && filteredData.profitFactor > 1.5 ? '#10b981' : filteredData?.profitFactor !== undefined && filteredData.profitFactor > 1 ? '#f59e0b' : '#ef4444',
            }}>
              {filteredData?.profitFactor !== undefined ? filteredData.profitFactor.toFixed(2) : '0.00'}
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Gross profit / Gross loss
            </small>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Win/Loss Ratio</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: filteredData?.winLossRatio !== undefined && filteredData.winLossRatio > 1 ? '#10b981' : '#ef4444',
            }}>
              {filteredData?.winLossRatio !== undefined ? filteredData.winLossRatio.toFixed(2) : '0.00'}
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Avg win / Avg loss
            </small>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Avg. Profit per Trade</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: filteredData?.avgProfit !== undefined && filteredData.avgProfit > 0 ? '#10b981' : '#ef4444',
            }}>
              ${filteredData?.avgProfit !== undefined ? filteredData.avgProfit.toFixed(2) : '0.00'}
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Net profit / Trade count
            </small>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Recovery Factor</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: '#64748b'
            }}>
              {filteredData?.totalReturn !== undefined && filteredData?.maxDrawdown !== undefined && filteredData.maxDrawdown !== 0 
                ? Math.abs(filteredData.totalReturn / filteredData.maxDrawdown).toFixed(2) 
                : 'N/A'}
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Total return / Max drawdown
            </small>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              marginTop: 0,
              marginBottom: '4px',
              fontWeight: '500' 
            }}>Trade Count</h3>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: '#64748b'
            }}>
              {filteredData?.trades ? filteredData.trades.length : 0}
            </p>
            <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Total number of trades
            </small>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <div className="dashboard-tabs" style={{
          display: 'flex', 
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '30px',
          overflowX: 'auto',
          gap: '10px',
          paddingBottom: '1px'
        }}>
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'overview' ? '#3b82f6' : '#64748b',
              backgroundColor: activeTab === 'overview' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderRadius: activeTab === 'overview' ? '8px 8px 0 0' : '0',
              borderBottom: activeTab === 'overview' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              boxShadow: activeTab === 'overview' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={activeTab === 'monthly' ? 'active' : ''} 
            onClick={() => setActiveTab('monthly')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'monthly' ? '#3b82f6' : '#64748b',
              backgroundColor: activeTab === 'monthly' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderRadius: activeTab === 'monthly' ? '8px 8px 0 0' : '0',
              borderBottom: activeTab === 'monthly' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              boxShadow: activeTab === 'monthly' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <FaChartBar /> Monthly Returns
          </button>
          <button 
            className={activeTab === 'drawdown' ? 'active' : ''} 
            onClick={() => setActiveTab('drawdown')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'drawdown' ? '#3b82f6' : '#64748b',
              backgroundColor: activeTab === 'drawdown' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderRadius: activeTab === 'drawdown' ? '8px 8px 0 0' : '0',
              borderBottom: activeTab === 'drawdown' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              boxShadow: activeTab === 'drawdown' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <FaChartBar /> Drawdown Analysis
          </button>
          <button 
            className={activeTab === 'clustering' ? 'active' : ''} 
            onClick={() => setActiveTab('clustering')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'clustering' ? '#3b82f6' : '#64748b',
              backgroundColor: activeTab === 'clustering' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderRadius: activeTab === 'clustering' ? '8px 8px 0 0' : '0',
              borderBottom: activeTab === 'clustering' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              boxShadow: activeTab === 'clustering' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <FaRandom /> Trade Clustering
          </button>
          <button 
            className={activeTab === 'trades' ? 'active' : ''} 
            onClick={() => setActiveTab('trades')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: activeTab === 'trades' ? '#3b82f6' : '#64748b',
              backgroundColor: activeTab === 'trades' ? '#f0f9ff' : 'transparent',
              border: 'none',
              borderRadius: activeTab === 'trades' ? '8px 8px 0 0' : '0',
              borderBottom: activeTab === 'trades' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '-1px',
              boxShadow: activeTab === 'trades' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <FaTable /> Trades
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="chart-container" style={{
              marginBottom: '40px',
              width: '100%'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartLine style={{ color: '#3b82f6' }} /> Equity Curve
              </h2>
              <div style={{ 
                height: '400px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#fafafa',
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <LineChart data={memoizedChartData?.equityCurve} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#64748b' }} 
                      tickFormatter={(value) => {
                        // Extract only the year part from the date
                        return value.substr(0, 4);
                      }}
                      stroke="#cbd5e1"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#334155', fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                    />
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Equity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ 
                        r: 6, 
                        fill: '#3b82f6', 
                        stroke: 'white', 
                        strokeWidth: 2,
                        onMouseOver: (_, event) => {
                          // Enhanced tooltip behavior could be added here
                          const target = event.target as SVGElement;
                          target.style.r = '8';
                        },
                        onMouseOut: (_, event) => {
                          const target = event.target as SVGElement;
                          target.style.r = '6';
                        }
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="none" 
                      fillOpacity={1} 
                      fill="url(#colorEquity)" 
                      isAnimationActive={true}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'monthly' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="chart-container" style={{ width: '100%' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartBar style={{ color: '#3b82f6' }} /> Monthly Returns
              </h2>
              <div style={{ 
                height: '400px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#fafafa',
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <BarChart data={memoizedChartData?.monthlyReturns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Monthly Return']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#334155', fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="return" 
                      name="Monthly Return" 
                      radius={[4, 4, 0, 0]}
                    >
                      {memoizedChartData?.monthlyReturns.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.return >= 0 ? "url(#greenGradient)" : "url(#redGradient)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#64748b',
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Monthly returns show the strategy's performance over time. 
                  Green bars represent profitable months, while red bars show months with losses.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'drawdown' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="drawdown-container" style={{ width: '100%' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartBar style={{ color: '#3b82f6' }} /> Drawdown Analysis
              </h2>
              <div style={{ 
                height: '400px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#fafafa',
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <BarChart data={memoizedChartData?.drawdowns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Drawdown']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#334155', fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                    />
                    <defs>
                      <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <Bar 
                      dataKey="value" 
                      name="Drawdown" 
                      fill="url(#drawdownGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#64748b',
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Drawdown analysis shows the largest declines from previous peaks. 
                  The maximum drawdown is {(data.maxDrawdown * 100).toFixed(2)}%, which occurred during the 
                  period with the deepest decline.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'clustering' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="clustering-container" style={{ width: '100%' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaRandom style={{ color: '#3b82f6' }} /> Trade Clustering Analysis
              </h2>
              <div style={{ 
                height: '400px', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#fafafa',
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke="#e2e8f0" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Duration (days)" 
                      unit=" days"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Return" 
                      unit="%" 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#cbd5e1"
                    />
                    <ZAxis type="number" dataKey="z" range={[40, 300]} name="Size" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      formatter={(value, name) => {
                        if (name === "Return") return [`${(Number(value) * 100).toFixed(2)}%`, name];
                        if (name === "Size") return [`$${value}`, name];
                        return [value, name];
                      }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: '#334155', fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                    />
                    <Scatter 
                      name="Trades" 
                      data={memoizedChartData?.tradeClusters} 
                      fill="#8884d8"
                    >
                      {memoizedChartData?.tradeClusters.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.cluster === 0 ? "#10b981" : entry.cluster === 1 ? "#ef4444" : "#f59e0b"} 
                          stroke={entry.cluster === 0 ? "#059669" : entry.cluster === 1 ? "#dc2626" : "#d97706"}
                          strokeWidth={1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#64748b',
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Trade clustering shows patterns in your trading behavior. 
                  Green dots represent profitable clusters, red dots show losing clusters, and orange dots 
                  indicate neutral clusters. The size of each dot corresponds to the position size.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'trades' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="trades-container" style={{ width: '100%' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaTable style={{ color: '#3b82f6' }} /> Trade History
              </h2>
              
              <div style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                overflow: 'hidden',
                width: '100%',
                marginBottom: '20px'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: '#f8fafc', 
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#334155',
                          cursor: 'pointer'
                        }} onClick={() => requestSort('time')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Date/Time {getSortIcon('time')}
                          </div>
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: '600',
                          color: '#334155',
                          cursor: 'pointer'
                        }} onClick={() => requestSort('side')}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Side {getSortIcon('side')}
                          </div>
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#334155',
                          cursor: 'pointer'
                        }} onClick={() => requestSort('price')}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            Price {getSortIcon('price')}
                          </div>
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#334155',
                          cursor: 'pointer'
                        }} onClick={() => requestSort('quantity')}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            Quantity {getSortIcon('quantity')}
                          </div>
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: '600',
                          color: '#334155'
                        }}>
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTrades.map((trade, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                        }}>
                          <td style={{ 
                            padding: '12px 16px', 
                            color: '#475569'
                          }}>
                            {new Date(trade.date).toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '12px 16px',
                            color: trade.type === 'buy' ? '#10b981' : '#ef4444',
                            fontWeight: '500'
                          }}>
                            {trade.type.toUpperCase()}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: '#475569',
                            fontFamily: 'monospace'
                          }}>
                            ${trade.price.toFixed(2)}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: '#475569',
                            fontFamily: 'monospace'
                          }}>
                            {trade.size.toFixed(4)}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: '#475569',
                            fontFamily: 'monospace'
                          }}>
                            ${(trade.price * trade.size).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px',
                    borderTop: '1px solid #e2e8f0',
                    gap: '8px'
                  }}>
                    <button 
                      onClick={() => setTradesPage(1)} 
                      disabled={tradesPage === 1}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: tradesPage === 1 ? '#f1f5f9' : 'white',
                        color: tradesPage === 1 ? '#94a3b8' : '#3b82f6',
                        cursor: tradesPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      First
                    </button>
                    <button 
                      onClick={() => setTradesPage(prev => Math.max(1, prev - 1))} 
                      disabled={tradesPage === 1}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: tradesPage === 1 ? '#f1f5f9' : 'white',
                        color: tradesPage === 1 ? '#94a3b8' : '#3b82f6',
                        cursor: tradesPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Previous
                    </button>
                    
                    <div style={{ 
                      padding: '6px 12px',
                      color: '#475569',
                      fontSize: '14px'
                    }}>
                      Page {tradesPage} of {totalPages}
                    </div>
                    
                    <button 
                      onClick={() => setTradesPage(prev => Math.min(totalPages, prev + 1))} 
                      disabled={tradesPage === totalPages}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: tradesPage === totalPages ? '#f1f5f9' : 'white',
                        color: tradesPage === totalPages ? '#94a3b8' : '#3b82f6',
                        cursor: tradesPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Next
                    </button>
                    <button 
                      onClick={() => setTradesPage(totalPages)} 
                      disabled={tradesPage === totalPages}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: tradesPage === totalPages ? '#f1f5f9' : 'white',
                        color: tradesPage === totalPages ? '#94a3b8' : '#3b82f6',
                        cursor: tradesPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#64748b',
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Trade history shows all executed trades with their details.
                  Click on column headers to sort by that field. You can track the chronological order 
                  of trades or analyze by price, quantity or trade type.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;

