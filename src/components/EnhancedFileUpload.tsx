import React, { useState, useRef } from 'react';

interface EnhancedFileUploadProps {
  onFileUpload: (data: any, sourceFormat: string) => void;
  onError: (error: string) => void;
  supportedFormats?: string[];
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({ 
  onFileUpload, 
  onError,
  supportedFormats = ['json', 'csv'] 
}) => {
  const [activeTab, setActiveTab] = useState<string>('file');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Process JSON file
  const processJsonFile = async (text: string) => {
    try {
      const jsonData = JSON.parse(text);
      onFileUpload(jsonData, 'json');
      return true;
    } catch (error) {
      onError(`Invalid JSON format: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
  
  // Process CSV file
  const processCsvFile = async (text: string) => {
    try {
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          // Try to parse numbers
          const value = values[index];
          if (!isNaN(Number(value))) {
            row[header] = Number(value);
          } else if (value === 'true') {
            row[header] = true;
          } else if (value === 'false') {
            row[header] = false;
          } else {
            row[header] = value;
          }
        });
        
        data.push(row);
      }
      
      onFileUpload({ data, headers }, 'csv');
      return true;
    } catch (error) {
      onError(`CSV processing error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
  
  // Handle file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onError("No file selected.");
      return;
    }

    setLoading(true);
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!supportedFormats.includes(fileExtension)) {
      onError(`Unsupported file format: .${fileExtension}. Please upload ${supportedFormats.map(f => '.' + f).join(' or ')}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Failed to read file content.");
        }
        
        let success = false;
        
        if (fileExtension === 'json') {
          success = await processJsonFile(text);
        } else if (fileExtension === 'csv') {
          success = await processCsvFile(text);
        }
        
        if (!success && fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        onError(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      onError("Error reading file.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setLoading(false);
    };
    
    reader.readAsText(file);
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.files = files;
      await handleFileChange({ target: { files } } as any);
    }
  };
  
  return (
    <div className="enhanced-file-upload">
      <div className="import-tabs">
        <button 
          className={activeTab === 'file' ? 'active' : ''} 
          onClick={() => setActiveTab('file')}
        >
          Upload File
        </button>
        <button 
          className={activeTab === 'api' ? 'active' : ''} 
          onClick={() => setActiveTab('api')}
        >
          API Connect
        </button>
        <button 
          className={activeTab === 'demo' ? 'active' : ''} 
          onClick={() => setActiveTab('demo')}
        >
          Demo Data
        </button>
      </div>
      
      <div className="import-content">
        {activeTab === 'file' && (
          <div 
            className={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={supportedFormats.map(format => `.${format}`).join(',')}
              className="file-input" 
            />
            
            {loading ? (
              <div className="upload-loading">
                <div className="upload-spinner"></div>
                <p>Processing file...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p className="upload-text">Drag & drop or click to upload</p>
                <div className="supported-formats">
                  <span>Supported formats: {supportedFormats.map(f => f.toUpperCase()).join(', ')}</span>
                </div>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'api' && (
          <div className="api-connect">
            <p>API connection coming soon!</p>
            <div className="api-form">
              <label>
                Exchange:
                <select disabled>
                  <option>Binance</option>
                  <option>Bybit</option>
                  <option>Kraken</option>
                </select>
              </label>
              <label>
                API Key:
                <input type="text" disabled placeholder="Enter your API key" />
              </label>
              <label>
                API Secret:
                <input type="password" disabled placeholder="Enter your API secret" />
              </label>
              <button disabled>Connect</button>
            </div>
          </div>
        )}
        
        {activeTab === 'demo' && (
          <div className="demo-data">
            <p>Load sample data to explore AlphaPulse features.</p>
            <div className="demo-buttons">
              <button className="demo-btn">BTC Mean Reversion</button>
              <button className="demo-btn">ETH Momentum</button>
              <button className="demo-btn">Multi-Asset Portfolio</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFileUpload; 