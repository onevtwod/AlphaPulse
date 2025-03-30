import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Types for PDF export
interface PDFExportOptions {
  title?: string;
  filename?: string;
  includeDate?: boolean;
  includeBenchmark?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
}

// Default options
const defaultOptions: PDFExportOptions = {
  title: 'AlphaPulse Strategy Report',
  filename: 'alphapulse-strategy-report',
  includeDate: true,
  includeBenchmark: true,
  orientation: 'portrait',
  pageSize: 'a4'
};

/**
 * Export dashboard to PDF
 * @param dashboardRef React.RefObject to the dashboard container
 * @param options PDF export options
 */
export const exportToPDF = async (
  dashboardRef: React.RefObject<HTMLDivElement>,
  options: PDFExportOptions = {}
): Promise<void> => {
  if (!dashboardRef.current) {
    console.error('Dashboard element not found');
    return;
  }

  // Merge with default options
  const mergedOptions = { ...defaultOptions, ...options };
  const {
    title,
    filename,
    includeDate,
    orientation,
    pageSize
  } = mergedOptions;

  try {
    // Prepare to capture
    const originalDisplayStyle = dashboardRef.current.style.display;
    
    // Set specific width for better rendering
    dashboardRef.current.style.width = orientation === 'landscape' ? '1200px' : '800px';
    dashboardRef.current.style.display = 'block';
    
    // Get all sections in the dashboard
    const sections = dashboardRef.current.querySelectorAll('section, .monte-carlo-chart, .risk-reward-map, .correlation-matrix, .drawdown-waterfall');
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize
    });
    
    // Add title and date
    doc.setFontSize(22);
    doc.text(title, 15, 20);
    
    if (includeDate) {
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 30);
    }
    
    let yPosition = 40; // Starting Y position after title and date
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      
      // Skip hidden sections
      if (section.style.display === 'none' || window.getComputedStyle(section).display === 'none') {
        continue;
      }
      
      // Check if we need a new page (margin at bottom: 10mm)
      const sectionHeight = section.offsetHeight;
      const estimatedHeightInMm = sectionHeight * 0.25; // Approximate conversion from px to mm
      
      if (yPosition + estimatedHeightInMm > (orientation === 'portrait' ? 277 : 190)) {
        doc.addPage();
        yPosition = 20; // Reset Y position for new page
      }
      
      try {
        // Capture section as image
        const canvas = await html2canvas(section, {
          scale: 1,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate width to maintain aspect ratio
        const pageWidth = orientation === 'portrait' ? 210 : 297;
        const contentWidth = pageWidth - 30; // 15mm margin on each side
        const aspectRatio = canvas.width / canvas.height;
        const imgWidth = contentWidth;
        const imgHeight = imgWidth / aspectRatio;
        
        // Add section image to PDF
        doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
        
        // Update Y position for next section
        yPosition += imgHeight + 15; // 15mm spacing between sections
      } catch (error) {
        console.error(`Error capturing section ${i}:`, error);
      }
    }
    
    // Restore original display style
    dashboardRef.current.style.display = originalDisplayStyle;
    dashboardRef.current.style.width = '';
    
    // Save the PDF
    doc.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// PDF Export Button Component
interface PDFExportButtonProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  options?: PDFExportOptions;
  buttonText?: string;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  dashboardRef,
  options,
  buttonText = 'Export to PDF',
  className = 'pdf-export-button'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(dashboardRef, options);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button 
      className={className} 
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? 'Exporting...' : buttonText}
    </button>
  );
};

/**
 * Function to generate a PDF preview URL
 * Creates and returns a URL to a preview PDF in-memory
 */
export const generatePDFPreviewURL = async (
  dashboardRef: React.RefObject<HTMLDivElement>,
  options: PDFExportOptions = {}
): Promise<string> => {
  if (!dashboardRef.current) {
    throw new Error('Dashboard element not found');
  }
  
  // Merge with default options
  const mergedOptions = { ...defaultOptions, ...options };
  const {
    title,
    includeDate,
    orientation,
    pageSize
  } = mergedOptions;

  // Create PDF document
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: pageSize
  });
  
  // Add title and date
  doc.setFontSize(22);
  doc.text(title, 15, 20);
  
  if (includeDate) {
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 15, 30);
  }
  
  let yPosition = 40;
  
  // Get all sections in the dashboard
  const sections = dashboardRef.current.querySelectorAll('section, .monte-carlo-chart, .risk-reward-map, .correlation-matrix');
  
  // Process each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i] as HTMLElement;
    
    // Skip hidden sections
    if (section.style.display === 'none' || window.getComputedStyle(section).display === 'none') {
      continue;
    }
    
    // Check if we need a new page
    const sectionHeight = section.offsetHeight;
    const estimatedHeightInMm = sectionHeight * 0.25;
    
    if (yPosition + estimatedHeightInMm > (orientation === 'portrait' ? 277 : 190)) {
      doc.addPage();
      yPosition = 20;
    }
    
    try {
      // Capture section as image
      const canvas = await html2canvas(section, {
        scale: 1,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate width to maintain aspect ratio
      const pageWidth = orientation === 'portrait' ? 210 : 297;
      const contentWidth = pageWidth - 30;
      const aspectRatio = canvas.width / canvas.height;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / aspectRatio;
      
      // Add section image to PDF
      doc.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      
      // Update Y position for next section
      yPosition += imgHeight + 15;
    } catch (error) {
      console.error(`Error capturing section ${i}:`, error);
    }
  }
  
  // Generate PDF as data URL
  const pdfDataUrl = doc.output('datauristring');
  
  return pdfDataUrl;
};

// Don't forget to add the import at the top
import { useState } from 'react'; 