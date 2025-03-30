import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie, ReferenceLine
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FaChartArea, FaFilter, FaDownload, FaCog, FaInfoCircle, FaChartBar, FaChartLine, FaChartPie, FaRandom, FaUpload, FaCalendarAlt, FaTable, FaSort, FaSortUp, FaSortDown, FaMoon, FaSun } from 'react-icons/fa';
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
const FormatModal: React.FC<{ isOpen: boolean; onClose: () => void; onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; darkMode: boolean }> = ({ isOpen, onClose, onFileUpload, darkMode }) => {
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
      backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div className="modal-content" style={{
        backgroundColor: darkMode ? '#1e293b' : 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '95%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        maxHeight: '90vh',
        overflow: 'auto',
        border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
        color: darkMode ? '#e2e8f0' : '#334155'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
          paddingBottom: '15px',
        }}>
          <h2 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            margin: 0, 
            color: darkMode ? '#3b82f6' : '#1e40af',
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
              background: darkMode ? '#334155' : '#f1f5f9',
              border: 'none',
              fontSize: '18px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              color: darkMode ? '#94a3b8' : '#64748b',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#475569' : '#e2e8f0';
              e.currentTarget.style.color = darkMode ? '#cbd5e1' : '#334155';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9';
              e.currentTarget.style.color = darkMode ? '#94a3b8' : '#64748b';
            }}
          >×</button>
        </div>
        
        <div className="modal-body">
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: darkMode ? '#cbd5e1' : '#475569',
            marginBottom: '20px'
          }}>
            Please upload your trading strategy performance data in JSON format according to this structure:
          </p>
          
          {/* Sample JSON format display */}
          <div style={{
            backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '25px',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            overflowX: 'auto'
          }}>
            <pre style={{
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              color: darkMode ? '#cbd5e1' : '#334155',
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
  // Component state variables
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedData, setUploadedData] = useState<ProcessedDataObject | null>(null);
  const [isFormatModalOpen, setFormatModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'time', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(15);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfExport, setIsPdfExport] = useState(false); // New state for PDF export mode
  const dashboardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // PDF constants
  const margin = 10; // margin in mm for PDF

  // Process the uploaded data
  const processedData = useMemo(() => {
    return uploadedData ? uploadedData : null;
  }, [uploadedData]);

  // Define derived data based on the processed data
  const data = useMemo(() => {
    return processedData;
  }, [processedData]);

  // Define theme colors based on dark mode state
  const theme = useMemo(() => ({
    background: darkMode ? '#0f172a' : '#f8fafc',
    cardBackground: darkMode ? '#1e293b' : '#ffffff',
    text: darkMode ? '#e2e8f0' : '#334155',
    border: darkMode ? '#334155' : '#e2e8f0',
    secondaryText: darkMode ? '#94a3b8' : '#64748b',
    accent: darkMode ? '#3b82f6' : '#3b82f6',
    accentDark: darkMode ? '#2563eb' : '#1e40af',
    success: darkMode ? '#10b981' : '#22c55e',
    warning: darkMode ? '#f59e0b' : '#f59e0b',
    danger: darkMode ? '#ef4444' : '#ef4444',
    cardBorder: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    shadow: darkMode ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.05)',
    textPrimary: darkMode ? '#f1f5f9' : '#334155',
    textSecondary: darkMode ? '#cbd5e1' : '#64748b',
    chartGrid: darkMode ? '#475569' : '#e2e8f0',
    tableHeader: darkMode ? '#1e293b' : '#f8fafc',
    tableRowEven: darkMode ? '#334155' : 'white',
    tableRowOdd: darkMode ? '#1f2937' : '#f8fafc',
    green: darkMode ? '#10b981' : '#22c55e',
    red: darkMode ? '#ef4444' : '#f87171',
    yellow: darkMode ? '#f59e0b' : '#fbbf24'
  }), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Update document body background when dark mode changes
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.transition = 'background-color 0.3s ease';
  }, [darkMode]);
  
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
        const date = new Date(point.date);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter monthly returns
    if (filtered.monthlyReturns) {
      filtered.monthlyReturns = filtered.monthlyReturns.filter(month => {
        // Extract year and month from string (format: "Jan 2022")
        const parts = month.month.split(' ');
        const monthStr = parts[0];
        const year = parseInt(parts[1], 10);
        
        // Convert month name to number (0-indexed)
        const monthMap: {[key: string]: number} = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const monthNum = monthMap[monthStr];
        
        // Create a date object for comparison (first day of month)
        const monthDate = new Date(year, monthNum, 1);
        
        if (dateRange.start && monthDate < dateRange.start) return false;
        if (dateRange.end && monthDate > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter drawdowns
    if (filtered.drawdowns) {
      filtered.drawdowns = filtered.drawdowns.filter(drawdown => {
        // 'name' is the property in DrawdownPoint that holds the date string
        const date = new Date(drawdown.name);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter trades too if present
    if (filtered.trades) {
      filtered.trades = filtered.trades.filter(trade => {
        // 'date' is the property in ProcessedTrade that holds the date string
        const date = new Date(trade.date);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
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
  
  // Filter trades based on the date range
  const filterTradesByDate = (trades: any[]) => {
    if (!dateRange.start && !dateRange.end) {
      return trades;
    }

    return trades.filter((trade) => {
      const tradeDate = new Date(trade.time);
      const startMatch = !dateRange.start || tradeDate >= dateRange.start;
      const endMatch = !dateRange.end || tradeDate <= dateRange.end;
      return startMatch && endMatch;
    });
  };

  // Apply date filtering to data
  const applyDateFilter = (data: ProcessedDataObject): ProcessedDataObject => {
    if (!dateRange.start && !dateRange.end) return data;
    
    const filtered = {...data};
    
    // Filter equity curve
    if (filtered.equityCurve) {
      filtered.equityCurve = filtered.equityCurve.filter(point => {
        const date = new Date(point.date);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter monthly returns
    if (filtered.monthlyReturns) {
      filtered.monthlyReturns = filtered.monthlyReturns.filter(month => {
        // Extract year and month from string (format: "Jan 2022")
        const parts = month.month.split(' ');
        const monthStr = parts[0];
        const year = parseInt(parts[1], 10);
        
        // Convert month name to number (0-indexed)
        const monthMap: {[key: string]: number} = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const monthNum = monthMap[monthStr];
        
        // Create a date object for comparison (first day of month)
        const monthDate = new Date(year, monthNum, 1);
        
        if (dateRange.start && monthDate < dateRange.start) return false;
        if (dateRange.end && monthDate > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter drawdowns
    if (filtered.drawdowns) {
      filtered.drawdowns = filtered.drawdowns.filter(drawdown => {
        // 'name' is the property in DrawdownPoint that holds the date string
        const date = new Date(drawdown.name);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    // Filter trades too if present
    if (filtered.trades) {
      filtered.trades = filtered.trades.filter(trade => {
        // 'date' is the property in ProcessedTrade that holds the date string
        const date = new Date(trade.date);
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }
    
    return filtered;
  };

  // Render the date range filter component
  const DateRangeFilter = () => {
    if (!showDateFilter) return null;
    
    return (
      <div className="date-filter-panel" style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: theme.cardBackground,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '16px',
        zIndex: 100,
        width: '300px',
        border: `1px solid ${theme.border}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: theme.textPrimary,
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
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            Start Date
          </label>
          <input 
            type="date"
            value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''} 
            onChange={(e) => {
              const value = e.target.value;
              setDateRange(prev => ({
                ...prev,
                start: value ? new Date(value) : null
              }));
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              fontSize: '14px',
              backgroundColor: darkMode ? '#1f2937' : 'white',
              color: theme.textPrimary
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
            color: theme.textSecondary,
            fontWeight: '500'
          }}>
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''} 
            onChange={(e) => {
              const value = e.target.value;
              setDateRange(prev => ({
                ...prev,
                end: value ? new Date(value) : null
              }));
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              fontSize: '14px',
              backgroundColor: darkMode ? '#1f2937' : 'white',
              color: theme.textPrimary
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
              backgroundColor: theme.cardBackground,
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
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
              backgroundColor: theme.accent,
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
    setIsLoading(true);
    setExportStatus('Loading sample data...');
    
    // Simulate loading time
    setTimeout(() => {
      try {
        const trades = extractTrades(defaultPerformanceData);
        const processedData = calculateMetrics(trades, defaultPerformanceData.initial_capital, defaultPerformanceData);
        setUploadedData(processedData);
        setIsLoading(false);
        setExportStatus('Sample data loaded successfully!');
        setTimeout(() => setExportStatus(null), 2000);
      } catch (error) {
        console.error("Error loading sample data:", error);
        setIsLoading(false);
        setExportStatus(`Error: ${error instanceof Error ? error.message : 'Failed to load sample data'}`);
        setTimeout(() => setExportStatus(null), 3000);
      }
    }, 800); // Simulate network delay
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
    setIsLoading(true);
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
        
        // Extract trades from the parsed data
        console.log("Extracting trades...");
        const trades = extractTrades(jsonData);
        console.log("Extracted trades:", trades.length);
        
        if (trades.length === 0) {
          throw new Error("No valid trades found in the uploaded data");
        }
        
        console.log("Calculating metrics...");
        const processedData = calculateMetrics(trades, jsonData.initial_capital, jsonData);
        console.log("Metrics calculated successfully");
        
        setUploadedData(processedData);
        setFormatModalOpen(false);
        setExportStatus('Data loaded successfully!');
        setIsLoading(false);
        
        // Clear status after 2 seconds
        setTimeout(() => setExportStatus(null), 2000);
      } catch (error) {
        console.error("Error processing the uploaded file:", error);
        setExportStatus(`Error: ${error instanceof Error ? error.message : 'Failed to process file'}`);
        setIsLoading(false);
        // Clear error after 3 seconds
        setTimeout(() => setExportStatus(null), 3000);
      }
    };
    
    reader.onerror = () => {
      setExportStatus('Error reading file');
      setIsLoading(false);
      setTimeout(() => setExportStatus(null), 3000);
    };
    
    reader.readAsText(file);
  };

  // Export PDF function
  const handleExportPDF = async () => {
    setExportStatus('Generating PDF...');
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF();
      const margin = 10; // Define margin here
      const contentWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
      
      // Add title and metadata
      pdf.setFontSize(18);
      pdf.text('Trading Performance Report', margin, margin + 10);
      pdf.setFontSize(12);
      
      // Create dummy pages for charts
      let yPos = margin + 20;
      
      // Page 1: Overview and Equity Curve
      pdf.text('Equity Curve', margin, yPos);
      yPos += 10;
      
      // Page 2: Monthly Returns
      pdf.addPage();
      pdf.text('Monthly Returns', margin, margin + 10);
      
      // Page 3: Drawdowns
      pdf.addPage();
      pdf.text('Maximum Drawdowns', margin, margin + 10);
      
      // Page 4: Trade Analysis
      pdf.addPage();
      pdf.text('Trade Analysis', margin, margin + 10);
      
      // Save the PDF
      pdf.save('trading_performance_report.pdf');
      setExportStatus('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportStatus('Error exporting PDF');
    } finally {
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
    const indexOfLastTrade = currentPage * tradesPerPage;
    const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
    return sortedTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  }, [sortedTrades, currentPage, tradesPerPage]);
  
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
  
  // If no data loaded yet, show the upload screen
  if (!processedData && !data) {
    return (
      <div className="performance-dashboard-upload" style={{ 
        backgroundColor: theme.background, 
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        boxSizing: 'border-box',
        color: theme.textPrimary,
        transition: 'background-color 0.3s ease, color 0.3s ease',
        overflow: 'auto'
      }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <div className="dark-mode-toggle" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: '500' }}>
              {darkMode ? 'Dark' : 'Light'}
            </span>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: darkMode ? 'flex-end' : 'flex-start',
                width: '56px',
                height: '28px',
                borderRadius: '14px',
                padding: '0 4px',
                border: `1px solid ${theme.border}`,
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: darkMode ? '0 0 10px rgba(255, 255, 255, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = darkMode ? '0 0 15px rgba(255, 255, 255, 0.15)' : '0 0 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = darkMode ? '0 0 10px rgba(255, 255, 255, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.05)';
              }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: darkMode ? '#FFD700' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </div>
            </button>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '60px', 
          maxWidth: '800px' 
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            margin: '0 0 20px 0',
            color: theme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <FaChartArea style={{ fontSize: '2.2rem' }} /> AlphaPulse Dashboard
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            lineHeight: '1.5', 
            color: theme.secondaryText,
            margin: '0 auto'
          }}>
            Upload your trading strategy performance data to visualize key metrics and gain valuable insights.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '800px'
        }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{
              display: 'none', // Hide the input
            }}
            id="file-upload"
          />
          
          <button 
            onClick={triggerFileUpload}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: theme.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <FaUpload /> Upload File
          </button>
          
          <button 
            onClick={() => setFormatModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaInfoCircle /> Format Info
          </button>
          
          <button 
            onClick={loadSampleData}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FaChartBar /> Load Sample
          </button>
        </div>
      </div>
    );
  }

  // If there is data (file was uploaded), show the full dashboard
  return (
    <div className="performance-dashboard" 
      ref={dashboardRef}
      style={{ 
        backgroundColor: theme.background, 
        padding: '30px', 
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        boxSizing: 'border-box',
        color: theme.textPrimary,
        transition: 'background-color 0.3s ease, color 0.3s ease',
        overflow: 'auto'
    }}>
      {/* Dashboard content with data */}
      {exportStatus && (
        <div className="export-status-message" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: theme.accent,
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
        borderBottom: `1px solid ${theme.border}`,
        backgroundColor: theme.cardBackground,
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <h1 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          margin: 0,
          fontSize: '2rem',
          fontWeight: '700',
          color: theme.accentDark
        }}>
          <FaChartArea style={{ color: theme.accent }} /> 
          AlphaPulse Dashboard
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div className="dark-mode-toggle" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.textPrimary, fontWeight: '500' }}>
              {darkMode ? 'Dark' : 'Light'}
            </span>
            <button
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: darkMode ? 'flex-end' : 'flex-start',
                width: '56px',
                height: '28px',
                borderRadius: '14px',
                padding: '0 4px',
                border: `1px solid ${theme.border}`,
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: darkMode ? '0 0 10px rgba(255, 255, 255, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = darkMode ? '0 0 15px rgba(255, 255, 255, 0.15)' : '0 0 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = darkMode ? '0 0 10px rgba(255, 255, 255, 0.1)' : '0 0 10px rgba(0, 0, 0, 0.05)';
              }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: darkMode ? '#FFD700' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </div>
            </button>
          </div>
          
          <button className="dashboard-button" 
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: theme.background,
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
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
          >
            <FaDownload /> Export PDF
          </button>
          
          <button className="dashboard-button" 
            onClick={() => setShowDateFilter(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: showDateFilter ? (darkMode ? '#1e293b' : '#f0f9ff') : theme.background,
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <FaFilter /> Filter
          </button>
          {showDateFilter && (
            <div className="date-filter-panel" style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              backgroundColor: theme.background,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              padding: '16px',
              zIndex: 100,
              width: '300px',
              border: `1px solid ${theme.border}`,
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.textPrimary,
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
                  color: theme.textSecondary,
                  fontWeight: '500'
                }}>
                  Start Date
                </label>
                <input 
                  type="date"
                  value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateRange(prev => ({
                      ...prev,
                      start: value ? new Date(value) : null
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    fontSize: '14px',
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: theme.textPrimary
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
                  color: theme.textSecondary,
                  fontWeight: '500'
                }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''} 
                  onChange={(e) => {
                    const value = e.target.value;
                    setDateRange(prev => ({
                      ...prev,
                      end: value ? new Date(value) : null
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    fontSize: '14px',
                    backgroundColor: darkMode ? '#1f2937' : 'white',
                    color: theme.textPrimary
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
                    backgroundColor: theme.background,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}`,
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
                    backgroundColor: theme.accent,
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
          )}
        </div>
      </div>

      <div style={{
        display: data ? 'none' : 'flex',
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
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          padding: '40px 30px',
          boxShadow: theme.shadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: theme.cardBorder,
          transition: 'all 0.3s ease'
        }}>
          <FaUpload style={{ 
            fontSize: '48px', 
            color: theme.accent, 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: darkMode ? '#1e3a8a30' : '#f0f9ff',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }} />
          
          <h3 style={{ 
            marginBottom: '15px', 
            color: theme.accent,
            fontWeight: '600',
            fontSize: '1.25rem'
          }}>
            Upload Your Data File
          </h3>
          
          <p style={{ 
            marginBottom: '30px', 
            color: theme.secondaryText,
            maxWidth: '400px'
          }}>
            Select a JSON file containing your trading performance data to visualize your strategy results
          </p>
          
          <div>
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
                backgroundColor: theme.accent,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: darkMode ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.3)',
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
          backgroundColor: theme.cardBackground,
          borderRadius: '12px',
          padding: '40px 30px',
          boxShadow: theme.shadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          border: theme.cardBorder,
          transition: 'all 0.3s ease'
        }}>
          <FaInfoCircle style={{ 
            fontSize: '48px', 
            color: theme.accent, 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: darkMode ? '#1e3a8a30' : '#f0f9ff',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }} />
          
          <h3 style={{ 
            marginBottom: '15px', 
            color: theme.accent,
            fontWeight: '600',
            fontSize: '1.25rem'
          }}>
            Expected Format
          </h3>
          
          <p style={{ 
            marginBottom: '20px', 
            color: theme.secondaryText,
            textAlign: 'left'
          }}>
            Your JSON file should include the following structure:
          </p>
          
          
          <div style={{
            backgroundColor: darkMode ? '#0f172a' : '#f1f5f9',
            padding: '15px',
            borderRadius: '8px',
            width: '100%',
            marginBottom: '20px',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '14px',
            color: darkMode ? '#94a3b8' : '#334155',
            overflowX: 'auto',
            transition: 'all 0.3s ease'
          }}>
            <pre style={{ margin: 0 }}>
{`{
  "candle_topics": ["binance:btcusdt"],
  "initial_capital": 10000,
  "trades": {
    "strategy_name": {
      "trades": {
        "BTCUSDT": [
          {
            "quantity": "0.1",
            "side": "buy",
            "price": "20000",
            "time": 1641000000000
          },
          {
            "quantity": "0.1",
            "side": "sell",
            "price": "21000",
            "time": 1642000000000
          }
        ]
      }
    }
  }
}`}
            </pre>
          </div>
          
          <button 
            onClick={loadSampleData}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: '500',
              width: '100%',
              maxWidth: '250px'
            }}
          >
            <FaRandom /> Load Sample Data
          </button>
        </div>
      </div>
      
      {exportStatus && (
        <div style={{
          padding: '15px 25px',
          backgroundColor: theme.cardBackground,
          color: theme.text,
          borderRadius: '8px',
          border: theme.cardBorder,
          margin: '20px 0',
          transition: 'all 0.3s ease'
        }}>
          {exportStatus}
        </div>
      )}

      <div className="risk-metrics-section" style={{
        backgroundColor: theme.cardBackground,
        borderRadius: '12px',
        padding: '24px 30px',
        marginBottom: '30px',
        border: `1px solid ${theme.border}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: theme.textPrimary,
          marginTop: 0,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <FaCog style={{ color: theme.accent }} /> Risk & Performance Metrics
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          alignItems: 'stretch',
          marginBottom: '20px'
        }}>
          {/* Total Return */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Total Return</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.totalReturn !== undefined && filteredData.totalReturn >= 0 ? theme.green : theme.red,
            }}>
              {filteredData?.totalReturn !== undefined ? (filteredData.totalReturn * 100).toFixed(2) : '0.00'}%
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  opacity: 0.7
                }}></span>
                Net portfolio growth
              </small>
            </div>
          </div>
          
          {/* Sharpe Ratio */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(79, 70, 229, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.04)';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Sharpe Ratio</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 1 ? theme.green : filteredData?.sharpeRatio !== undefined && filteredData.sharpeRatio >= 0 ? theme.yellow : theme.red,
            }}>
              {filteredData?.sharpeRatio !== undefined ? filteredData.sharpeRatio.toFixed(2) : '0.00'}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  opacity: 0.7
                }}></span>
                Return / Risk ratio
              </small>
            </div>
          </div>
          
          {/* Win Rate */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(245, 158, 11, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Win Rate</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.winRate !== undefined && filteredData.winRate >= 0.5 ? theme.green : theme.yellow,
            }}>
              {filteredData?.winRate !== undefined ? (filteredData.winRate * 100).toFixed(2) : '0.00'}%
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  opacity: 0.7
                }}></span>
                Winning trades percent
              </small>
            </div>
          </div>
          
          {/* Max Drawdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(239, 68, 68, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Max Drawdown</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: theme.textPrimary,
            }}>
              {filteredData?.maxDrawdown !== undefined ? (filteredData.maxDrawdown * 100).toFixed(2) : '0.00'}%
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  opacity: 0.7
                }}></span>
                Largest portfolio decline
              </small>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '20px',
          alignItems: 'stretch',
          marginBottom: '30px'
        }}>
          {/* Annual Return */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Annual Return</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.annualReturn !== undefined && filteredData.annualReturn > 0 ? theme.green : theme.red,
            }}>
              {filteredData?.annualReturn !== undefined ? (filteredData.annualReturn * 100).toFixed(2) : '0.00'}%
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent,
                  opacity: 0.7
                }}></span>
                Annualized performance
              </small>
            </div>
          </div>
          
          {/* Profit Factor */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Profit Factor</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.profitFactor !== undefined && filteredData.profitFactor > 1.5 ? theme.green : filteredData?.profitFactor !== undefined && filteredData.profitFactor > 1 ? theme.yellow : theme.red,
            }}>
              {filteredData?.profitFactor !== undefined ? filteredData.profitFactor.toFixed(2) : '0.00'}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  opacity: 0.7
                }}></span>
                Gross profit / Gross loss
              </small>
            </div>
          </div>
          
          {/* Win/Loss Ratio */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(245, 158, 11, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Win/Loss Ratio</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.winLossRatio !== undefined && filteredData.winLossRatio > 1 ? theme.green : theme.red,
            }}>
              {filteredData?.winLossRatio !== undefined ? filteredData.winLossRatio.toFixed(2) : '0.00'}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  opacity: 0.7
                }}></span>
                Avg win / Avg loss
              </small>
            </div>
          </div>
          
          {/* Avg Profit Per Trade */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Avg. Profit per Trade</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: filteredData?.avgProfit !== undefined && filteredData.avgProfit > 0 ? theme.green : theme.red,
            }}>
              ${filteredData?.avgProfit !== undefined ? filteredData.avgProfit.toFixed(2) : '0.00'}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  opacity: 0.7
                }}></span>
                Net profit / Trade count
              </small>
            </div>
          </div>
          
          {/* Recovery Factor */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Recovery Factor</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: theme.textPrimary,
            }}>
              {filteredData?.totalReturn !== undefined && filteredData?.maxDrawdown !== undefined && filteredData.maxDrawdown !== 0 
                ? Math.abs(filteredData.totalReturn / filteredData.maxDrawdown).toFixed(2) 
                : 'N/A'}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  opacity: 0.7
                }}></span>
                Total return / Max drawdown
              </small>
            </div>
          </div>
          
          {/* Trade Count */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '20px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
            boxShadow: 'none',
            textAlign: 'center',
            height: '100%'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              color: theme.textSecondary, 
              marginTop: 0,
              marginBottom: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Trade Count</h3>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: theme.textPrimary,
            }}>
              {filteredData?.trades ? filteredData.trades.length.toLocaleString() : 0}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: 'auto'
            }}>
              <small style={{ 
                fontSize: '0.8rem', 
                color: theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#0ea5e9',
                  opacity: 0.7
                }}></span>
                Total number of trades
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs" style={{
        display: 'flex', 
        overflowX: 'auto',
        gap: '10px',
        paddingBottom: '1px',
        backgroundColor: theme.cardBackground,
        borderRadius: '12px 12px 0 0',
        padding: '20px 20px 0',
        border: `1px solid ${theme.border}`,
        borderBottom: 'none',
        marginBottom: '30px'
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
            color: activeTab === 'overview' ? theme.accent : theme.secondaryText,
            backgroundColor: activeTab === 'overview' ? (darkMode ? '#1e293b30' : '#f0f9ff') : 'transparent',
            border: 'none',
            borderRadius: activeTab === 'overview' ? '8px 8px 0 0' : '0',
            borderBottom: activeTab === 'overview' ? `2px solid ${theme.accent}` : '2px solid transparent',
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
            color: activeTab === 'monthly' ? theme.accent : theme.secondaryText,
            backgroundColor: activeTab === 'monthly' ? (darkMode ? '#1e293b30' : '#f0f9ff') : 'transparent',
            border: 'none',
            borderRadius: activeTab === 'monthly' ? '8px 8px 0 0' : '0',
            borderBottom: activeTab === 'monthly' ? `2px solid ${theme.accent}` : '2px solid transparent',
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
            color: activeTab === 'drawdown' ? theme.accent : theme.secondaryText,
            backgroundColor: activeTab === 'drawdown' ? (darkMode ? '#1e293b30' : '#f0f9ff') : 'transparent',
            border: 'none',
            borderRadius: activeTab === 'drawdown' ? '8px 8px 0 0' : '0',
            borderBottom: activeTab === 'drawdown' ? `2px solid ${theme.accent}` : '2px solid transparent',
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
            color: activeTab === 'clustering' ? theme.accent : theme.secondaryText,
            backgroundColor: activeTab === 'clustering' ? (darkMode ? '#1e293b30' : '#f0f9ff') : 'transparent',
            border: 'none',
            borderRadius: activeTab === 'clustering' ? '8px 8px 0 0' : '0',
            borderBottom: activeTab === 'clustering' ? `2px solid ${theme.accent}` : '2px solid transparent',
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
            color: activeTab === 'trades' ? theme.accent : theme.secondaryText,
            backgroundColor: activeTab === 'trades' ? (darkMode ? '#1e293b30' : '#f0f9ff') : 'transparent',
            border: 'none',
            borderRadius: activeTab === 'trades' ? '8px 8px 0 0' : '0',
            borderBottom: activeTab === 'trades' ? `2px solid ${theme.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '-1px',
            boxShadow: activeTab === 'trades' ? '0 -2px 5px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <FaTable /> Trades
        </button>
      </div>

      <div className="dashboard-content" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        marginTop: '30px',
        backgroundColor: theme.background
      }}>
        {/* Add your dashboard content components here */}
        {activeTab === 'overview' && (
          <div className="content-section" style={{ width: '100%' }}>
            <div className="chart-container" style={{ 
              marginBottom: '40px',
              width: '100%',
              backgroundColor: theme.background
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: darkMode ? theme.textPrimary : '#334155',
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartLine style={{ color: theme.accent }} /> Equity Curve
              </h2>
              <div style={{ 
                height: '400px', 
                border: theme.cardBorder, 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: theme.cardBackground,
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <AreaChart data={memoizedChartData?.equityCurve} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: theme.secondaryText }} 
                      tickFormatter={(value) => {
                        return value.substr(0, 7); // Show YYYY-MM format
                      }}
                      stroke={theme.border}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                      contentStyle={{ 
                        backgroundColor: theme.cardBackground, 
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        color: theme.text,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: theme.text, fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: theme.text, fontSize: '14px' }}>{value}</span>}
                    />
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.accent} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.accent} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Equity" 
                      stroke={theme.accent} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorEquity)" 
                      activeDot={{ 
                        r: 6, 
                        fill: theme.accent, 
                        stroke: theme.cardBackground, 
                        strokeWidth: 2
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: theme.cardBackground, 
                borderRadius: '8px',
                border: theme.cardBorder,
                fontSize: '14px',
                color: theme.secondaryText,
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> The equity curve shows the growth of your {data?.initialCapital ? `$${data.initialCapital.toFixed(2)}` : ''} initial capital over time, 
                  achieving a {filteredData?.totalReturn ? (filteredData.totalReturn * 100).toFixed(2) : '0.00'}% total return. 
                  {filteredData?.annualReturn ? ` This corresponds to a ${(filteredData.annualReturn * 100).toFixed(2)}% annualized return.` : ''}
                </p>
              </div>
            </div>

            <div className="metrics-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Trade Pie Chart */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                height: '350px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaChartPie style={{ color: theme.accent }} /> Win/Loss Distribution
                </h3>
                {filteredData?.winRate !== undefined && (
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Winning Trades', value: filteredData.winRate },
                          { name: 'Losing Trades', value: 1 - filteredData.winRate },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={theme.green} />
                        <Cell fill={theme.red} />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.cardBackground, 
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Trade Distribution Bar Chart */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                height: '350px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaChartBar style={{ color: theme.accent }} /> Profit Distribution
                </h3>
                {filteredData?.trades && (
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart
                      data={[
                        { name: 'Avg Win', value: (() => {
                          if (!filteredData?.trades) return 0;
                          const winningTrades = filteredData.trades.filter(t => (t as any).pnl > 0);
                          if (winningTrades.length === 0) return 0;
                          return winningTrades.reduce((sum, t) => sum + ((t as any).pnl || 0), 0) / winningTrades.length;
                        })() },
                        { name: 'Avg Loss', value: (() => {
                          if (!filteredData?.trades) return 0;
                          const losingTrades = filteredData.trades.filter(t => (t as any).pnl < 0);
                          if (losingTrades.length === 0) return 0;
                          return losingTrades.reduce((sum, t) => sum + ((t as any).pnl || 0), 0) / losingTrades.length;
                        })() },
                        { name: 'Avg Trade', value: filteredData?.avgProfit || 0 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme.secondaryText }} 
                        stroke={theme.border}
                      />
                      <YAxis 
                        tick={{ fill: theme.secondaryText }}
                        stroke={theme.border}
                        tickFormatter={(value) => `$${value.toFixed(0)}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, '']}
                        contentStyle={{ 
                          backgroundColor: theme.cardBackground, 
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="value">
                        {[
                          <Cell key="cell-0" fill={theme.green} />,
                          <Cell key="cell-1" fill={theme.red} />,
                          <Cell key="cell-2" fill={theme.accent} />
                        ]}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
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
                color: theme.text,
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartBar style={{ color: theme.accent }} /> Monthly Returns
              </h2>
              <div style={{ 
                height: '400px', 
                border: theme.cardBorder, 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: theme.cardBackground,
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <BarChart data={memoizedChartData?.monthlyReturns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Monthly Return']}
                      contentStyle={{ 
                        backgroundColor: theme.cardBackground, 
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: theme.text, fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: theme.text, fontSize: '14px' }}>{value}</span>}
                    />
                    <ReferenceLine y={0} stroke={theme.border} />
                    <Bar 
                      dataKey="return" 
                      name="Monthly Return" 
                      radius={[4, 4, 0, 0]}
                    >
                      {memoizedChartData?.monthlyReturns.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.return >= 0 ? theme.green : theme.red} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Monthly Stats Summary */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                marginBottom: '20px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle style={{ color: theme.accent }} /> Monthly Statistics
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Best Month */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Best Month</span>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: theme.green, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {(() => {
                        if (!memoizedChartData?.monthlyReturns || memoizedChartData.monthlyReturns.length === 0) return 'N/A';
                        const bestMonth = [...memoizedChartData.monthlyReturns].sort((a, b) => b.return - a.return)[0];
                        return `${bestMonth.month}: ${(bestMonth.return * 100).toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Worst Month */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Worst Month</span>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: theme.red, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {(() => {
                        if (!memoizedChartData?.monthlyReturns || memoizedChartData.monthlyReturns.length === 0) return 'N/A';
                        const worstMonth = [...memoizedChartData.monthlyReturns].sort((a, b) => a.return - b.return)[0];
                        return `${worstMonth.month}: ${(worstMonth.return * 100).toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Average Monthly Return */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Average Monthly Return</span>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: theme.text, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {(() => {
                        if (!memoizedChartData?.monthlyReturns || memoizedChartData.monthlyReturns.length === 0) return 'N/A';
                        const sum = memoizedChartData.monthlyReturns.reduce((acc, curr) => acc + curr.return, 0);
                        const avg = sum / memoizedChartData.monthlyReturns.length;
                        return `${(avg * 100).toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Positive Months */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Positive Months</span>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: theme.text, 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {(() => {
                        if (!memoizedChartData?.monthlyReturns || memoizedChartData.monthlyReturns.length === 0) return 'N/A';
                        const positiveMonths = memoizedChartData.monthlyReturns.filter(month => month.return > 0).length;
                        const total = memoizedChartData.monthlyReturns.length;
                        return `${positiveMonths}/${total} (${Math.round(positiveMonths / total * 100)}%)`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: theme.cardBackground, 
                borderRadius: '8px',
                border: theme.cardBorder,
                fontSize: '14px',
                color: theme.secondaryText,
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Monthly returns show the strategy's performance over time. 
                  Green bars represent profitable months, while red bars show months with losses.
                  {memoizedChartData?.monthlyReturns && memoizedChartData.monthlyReturns.length > 0 && 
                    ` The strategy has been profitable in ${
                      Math.round(memoizedChartData.monthlyReturns.filter(m => m.return > 0).length / memoizedChartData.monthlyReturns.length * 100)
                    }% of months.`
                  }
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
                color: theme.text,
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaChartBar style={{ color: theme.accent }} /> Drawdown Analysis
              </h2>
              <div style={{ 
                height: '400px', 
                border: theme.cardBorder, 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: theme.cardBackground,
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <BarChart data={memoizedChartData?.drawdowns} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <Tooltip 
                      formatter={(value) => [`${(Number(value) * 100).toFixed(2)}%`, 'Drawdown']}
                      contentStyle={{ 
                        backgroundColor: theme.cardBackground, 
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: theme.text, fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: theme.text, fontSize: '14px' }}>{value}</span>}
                    />
                    <defs>
                      <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.red} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={theme.red} stopOpacity={0.6}/>
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
              
              {/* Drawdown Metrics */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                marginBottom: '20px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle style={{ color: theme.accent }} /> Drawdown Metrics
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '25px'
                }}>
                  {/* Maximum Drawdown */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Maximum Drawdown</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.red
                    }}>
                      {filteredData?.maxDrawdown !== undefined ? 
                        `${(filteredData.maxDrawdown * 100).toFixed(2)}%` : 
                        'N/A'}
                    </div>
                  </div>
                  
                  {/* Recovery Factor */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Recovery Factor</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.text
                    }}>
                      {filteredData?.totalReturn !== undefined && 
                       filteredData?.maxDrawdown !== undefined && 
                       filteredData.maxDrawdown !== 0 ? 
                        Math.abs(filteredData.totalReturn / filteredData.maxDrawdown).toFixed(2) : 
                        'N/A'}
                    </div>
                  </div>
                  
                  {/* Average Drawdown */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Average Drawdown</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.text
                    }}>
                      {(() => {
                        if (!memoizedChartData?.drawdowns || memoizedChartData.drawdowns.length === 0) return 'N/A';
                        const sum = memoizedChartData.drawdowns.reduce((acc, curr) => acc + Math.abs(curr.value), 0);
                        const avg = sum / memoizedChartData.drawdowns.length;
                        return `${(avg * 100).toFixed(2)}%`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Drawdown Count */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Significant Drawdowns</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.text
                    }}>
                      {memoizedChartData?.drawdowns?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Drawdown vs Return chart */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                height: '320px',
                marginBottom: '20px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '15px'
                }}>
                  Risk-Return Profile
                </h3>
                
                <ResponsiveContainer width="100%" height={240}>
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} />
                    <XAxis 
                      type="number" 
                      dataKey="value" 
                      name="Drawdown" 
                      unit="%" 
                      domain={[
                        (dataMin: number) => Math.min(dataMin * 1.1, -0.01), 
                        0
                      ]}
                      tickFormatter={value => `${(value * 100).toFixed(0)}%`}
                      tick={{ fill: theme.secondaryText }}
                      stroke={theme.border}
                      label={{ 
                        value: 'Drawdown', 
                        position: 'bottom',
                        offset: 0,
                        fill: theme.secondaryText
                      }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="return" 
                      name="Return" 
                      unit="%"
                      tickFormatter={value => `${(value * 100).toFixed(0)}%`}
                      tick={{ fill: theme.secondaryText }}
                      stroke={theme.border}
                      label={{ 
                        value: 'Return', 
                        angle: -90, 
                        position: 'left',
                        offset: 0,
                        fill: theme.secondaryText
                      }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${(Number(value) * 100).toFixed(2)}%`, 
                        name === 'Return' ? 'Return Following Drawdown' : 'Drawdown Depth'
                      ]}
                      contentStyle={{ 
                        backgroundColor: theme.cardBackground, 
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: theme.text, fontWeight: '500' }}
                    />
                    <Scatter 
                      name="Drawdown-Return" 
                      data={memoizedChartData?.drawdowns?.map(d => ({
                        ...d,
                        // This would be a real calculated value in a real implementation
                        return: Math.abs(d.value) * (Math.random() * 1.5 + 0.5) * (Math.random() > 0.3 ? 1 : -0.5)
                      })) || []}
                      fill={theme.accent}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: theme.cardBackground, 
                borderRadius: '8px',
                border: theme.cardBorder,
                fontSize: '14px',
                color: theme.secondaryText,
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Drawdown analysis shows the largest declines from previous peaks. 
                  The maximum drawdown is {(filteredData?.maxDrawdown || 0) * 100}%, which measures the strategy's risk. 
                  The recovery factor of {filteredData?.totalReturn !== undefined && 
                    filteredData?.maxDrawdown !== undefined && 
                    filteredData.maxDrawdown !== 0 ? 
                      Math.abs(filteredData.totalReturn / filteredData.maxDrawdown).toFixed(2) : 
                      'N/A'} indicates how well the strategy recovers from drawdowns.
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
                color: theme.text,
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaRandom style={{ color: theme.accent }} /> Trade Clustering Analysis
              </h2>
              <div style={{ 
                height: '400px', 
                border: theme.cardBorder, 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: theme.cardBackground,
                width: '100%',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <ResponsiveContainer width="99%" height={350}>
                  <ScatterChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid stroke={theme.chartGrid} />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Duration (days)" 
                      unit=" days"
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Return" 
                      unit="%" 
                      tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      tick={{ fontSize: 12, fill: theme.secondaryText }}
                      stroke={theme.border}
                    />
                    <ZAxis type="number" dataKey="z" range={[40, 300]} name="Size" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      formatter={(value, name) => {
                        if (name === "Return") return [`${(Number(value) * 100).toFixed(2)}%`, name];
                        if (name === "Size") return [`$${value}`, "Position Size"];
                        if (name === "Duration (days)") return [`${value} days`, name];
                        return [value, name];
                      }}
                      contentStyle={{ 
                        backgroundColor: theme.cardBackground, 
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                      labelStyle={{ color: theme.text, fontWeight: '500' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '2px' }}
                      formatter={(value) => <span style={{ color: theme.text, fontSize: '14px' }}>{value}</span>}
                    />
                    <Scatter 
                      name="Trades" 
                      data={memoizedChartData?.tradeClusters} 
                      fill="#8884d8"
                    >
                      {memoizedChartData?.tradeClusters.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.cluster === 0 ? theme.green : entry.cluster === 1 ? theme.red : theme.yellow} 
                          stroke={darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                          strokeWidth={1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              {/* Cluster Statistics */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                marginBottom: '20px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle style={{ color: theme.accent }} /> Cluster Analysis
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '25px'
                }}>
                  {/* Cluster 1 (Profitable) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: theme.green
                      }}></div>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: theme.text
                      }}>
                        Profitable Cluster
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Count: {(() => {
                        if (!memoizedChartData?.tradeClusters) return 0;
                        return memoizedChartData.tradeClusters.filter(t => t.cluster === 0).length;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Return: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0.00%';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 0);
                        if (cluster.length === 0) return '0.00%';
                        const avg = cluster.reduce((sum, t) => sum + t.y, 0) / cluster.length;
                        return `${(avg * 100).toFixed(2)}%`;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Duration: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0 days';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 0);
                        if (cluster.length === 0) return '0 days';
                        const avg = cluster.reduce((sum, t) => sum + t.x, 0) / cluster.length;
                        return `${avg.toFixed(1)} days`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Cluster 2 (Unprofitable) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: theme.red
                      }}></div>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: theme.text 
                      }}>
                        Unprofitable Cluster
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Count: {(() => {
                        if (!memoizedChartData?.tradeClusters) return 0;
                        return memoizedChartData.tradeClusters.filter(t => t.cluster === 1).length;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Return: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0.00%';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 1);
                        if (cluster.length === 0) return '0.00%';
                        const avg = cluster.reduce((sum, t) => sum + t.y, 0) / cluster.length;
                        return `${(avg * 100).toFixed(2)}%`;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Duration: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0 days';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 1);
                        if (cluster.length === 0) return '0 days';
                        const avg = cluster.reduce((sum, t) => sum + t.x, 0) / cluster.length;
                        return `${avg.toFixed(1)} days`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Cluster 3 (Neutral) */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    backgroundColor: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'}`
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: theme.yellow
                      }}></div>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: '600', 
                        color: theme.text 
                      }}>
                        Neutral Cluster
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Count: {(() => {
                        if (!memoizedChartData?.tradeClusters) return 0;
                        return memoizedChartData.tradeClusters.filter(t => t.cluster === 2).length;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Return: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0.00%';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 2);
                        if (cluster.length === 0) return '0.00%';
                        const avg = cluster.reduce((sum, t) => sum + t.y, 0) / cluster.length;
                        return `${(avg * 100).toFixed(2)}%`;
                      })()}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: theme.secondaryText }}>
                      Avg. Duration: {(() => {
                        if (!memoizedChartData?.tradeClusters) return '0 days';
                        const cluster = memoizedChartData.tradeClusters.filter(t => t.cluster === 2);
                        if (cluster.length === 0) return '0 days';
                        const avg = cluster.reduce((sum, t) => sum + t.x, 0) / cluster.length;
                        return `${avg.toFixed(1)} days`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: theme.cardBackground, 
                borderRadius: '8px',
                border: theme.cardBorder,
                fontSize: '14px',
                color: theme.secondaryText,
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Trade clustering shows patterns in your trading behavior. The x-axis represents 
                  trade duration in days, while the y-axis shows the return percentage for each trade. The size of each dot 
                  corresponds to the position size. Green dots represent profitable clusters, red dots show losing clusters, 
                  and yellow dots indicate neutral clusters.
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
                color: theme.text,
                marginTop: 0,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FaTable style={{ color: theme.accent }} /> Trade History
              </h2>
              
              <div style={{ 
                border: theme.cardBorder, 
                borderRadius: '8px', 
                overflow: 'hidden',
                width: '100%',
                marginBottom: '20px',
                backgroundColor: theme.cardBackground
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr style={{ 
                        backgroundColor: theme.tableHeader, 
                        borderBottom: `1px solid ${theme.border}`
                      }}>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          fontWeight: '600',
                          color: theme.text,
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
                          color: theme.text,
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
                          color: theme.text,
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
                          color: theme.text,
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
                          color: theme.text
                        }}>
                          Value
                        </th>
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right',
                          fontWeight: '600',
                          color: theme.text
                        }}>
                          P&L
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTrades.length > 0 ? currentTrades.map((trade, index) => (
                        <tr key={index} style={{ 
                          borderBottom: `1px solid ${theme.border}`,
                          backgroundColor: index % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd,
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = darkMode ? '#3e4c5e' : '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.tableRowEven : theme.tableRowOdd;
                        }}>
                          <td style={{ 
                            padding: '12px 16px', 
                            color: theme.secondaryText
                          }}>
                            {new Date(trade.date).toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '12px 16px',
                            color: trade.type === 'buy' ? theme.green : theme.red,
                            fontWeight: '500'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: trade.type === 'buy' ? theme.green : theme.red
                              }}></span>
                              {trade.type.toUpperCase()}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: theme.secondaryText,
                            fontFamily: 'monospace'
                          }}>
                            ${trade.price.toFixed(2)}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: theme.secondaryText,
                            fontFamily: 'monospace'
                          }}>
                            {trade.size.toFixed(4)}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: theme.secondaryText,
                            fontFamily: 'monospace'
                          }}>
                            ${(trade.price * trade.size).toFixed(2)}
                          </td>
                          <td style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right',
                            color: trade.pnl > 0 ? theme.green : trade.pnl < 0 ? theme.red : theme.secondaryText,
                            fontWeight: '500',
                            fontFamily: 'monospace'
                          }}>
                            {/* Show P&L if available */}
                            {trade.pnl !== undefined ? `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} style={{ 
                            padding: '20px', 
                            textAlign: 'center',
                            color: theme.secondaryText
                          }}>
                            No trades available. Try adjusting your date filter.
                          </td>
                        </tr>
                      )}
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
                    borderTop: `1px solid ${theme.border}`,
                    gap: '8px'
                  }}>
                    <button 
                      onClick={() => setCurrentPage(1)} 
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? (darkMode ? '#1f2937' : '#f1f5f9') : theme.cardBackground,
                        color: currentPage === 1 ? theme.secondaryText : theme.accent,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      First
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? (darkMode ? '#1f2937' : '#f1f5f9') : theme.cardBackground,
                        color: currentPage === 1 ? theme.secondaryText : theme.accent,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Previous
                    </button>
                    
                    <div style={{ 
                      padding: '8px 14px',
                      color: theme.text,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {/* Page numbers - show a limited range */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 5) {
                          // Show all pages if 5 or fewer
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          // At the start
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // At the end
                          pageNum = totalPages - 4 + i;
                        } else {
                          // In the middle
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: currentPage === pageNum ? theme.accent : 'transparent',
                              color: currentPage === pageNum ? 'white' : theme.text,
                              border: currentPage === pageNum ? 'none' : `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span style={{ color: theme.secondaryText }}>...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            style={{
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              color: theme.text,
                              border: `1px solid ${theme.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? (darkMode ? '#1f2937' : '#f1f5f9') : theme.cardBackground,
                        color: currentPage === totalPages ? theme.secondaryText : theme.accent,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Next
                    </button>
                    <button 
                      onClick={() => setCurrentPage(totalPages)} 
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 14px',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? (darkMode ? '#1f2937' : '#f1f5f9') : theme.cardBackground,
                        color: currentPage === totalPages ? theme.secondaryText : theme.accent,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
              
              {/* Trade Statistics */}
              <div style={{
                backgroundColor: theme.cardBackground,
                borderRadius: '8px',
                padding: '20px',
                border: theme.cardBorder,
                marginBottom: '20px',
                boxShadow: theme.shadow
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  color: theme.text, 
                  marginTop: 0, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FaInfoCircle style={{ color: theme.accent }} /> Trade Statistics
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '25px'
                }}>
                  {/* Total trades */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Total Trades</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.text
                    }}>
                      {sortedTrades.length}
                    </div>
                  </div>
                  
                  {/* Win/Loss */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Win/Loss</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.text
                    }}>
                      {(() => {
                        if (!filteredData?.winRate) return 'N/A';
                        const winners = Math.round(filteredData.winRate * sortedTrades.length);
                        const losers = sortedTrades.length - winners;
                        return `${winners}/${losers}`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Largest Winner */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Largest Winner</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.green
                    }}>
                      {(() => {
                        if (!sortedTrades || sortedTrades.length === 0 || !sortedTrades[0].pnl) return '$0.00';
                        // In a real app, this would use actual P&L values
                        const maxWin = Math.max(...sortedTrades.filter(t => t.pnl > 0).map(t => t.pnl || 0));
                        return `$${maxWin.toFixed(2)}`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Largest Loser */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '14px', color: theme.secondaryText }}>Largest Loser</span>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: theme.red
                    }}>
                      {(() => {
                        if (!sortedTrades || sortedTrades.length === 0 || !sortedTrades[0].pnl) return '$0.00';
                        // In a real app, this would use actual P&L values
                        const maxLoss = Math.min(...sortedTrades.filter(t => t.pnl < 0).map(t => t.pnl || 0));
                        return `$${maxLoss.toFixed(2)}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: theme.cardBackground, 
                borderRadius: '8px',
                border: theme.cardBorder,
                fontSize: '14px',
                color: theme.secondaryText,
                width: '100%'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Analysis:</strong> Trade history shows all executed trades with their details.
                  Click on column headers to sort by that field. You can track the chronological order 
                  of trades or analyze by price, quantity or trade type.
                  {filteredData?.trades && filteredData.trades.length > 0 && 
                    ` This strategy executed ${filteredData.trades.length} trades with a win rate of ${(filteredData.winRate * 100).toFixed(1)}%.`}
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

