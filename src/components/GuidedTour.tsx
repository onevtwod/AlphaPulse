import React, { useState, useEffect } from 'react';

// Step interface defines each tour step
interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  isActive,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  // Define tour steps
  const tourSteps: TourStep[] = [
    {
      target: '.dashboard-header',
      title: 'Welcome to AlphaPulse',
      content: 'This dashboard helps you analyze trading strategy performance with comprehensive metrics and visualizations.',
      position: 'bottom'
    },
    {
      target: '.enhanced-file-upload',
      title: 'Import Your Data',
      content: 'Start by uploading a JSON or CSV file with your trading data, or connect to an exchange API.',
      position: 'bottom'
    },
    {
      target: '.metrics-section:first-of-type',
      title: 'Core Metrics',
      content: 'These key metrics provide a quick overview of your strategy performance, including returns and risk.',
      position: 'right'
    },
    {
      target: '.benchmark-section',
      title: 'Benchmark Comparison',
      content: 'Compare your strategy against a Buy & Hold approach to see if you beat the market.',
      position: 'left'
    },
    {
      target: '.charts-section',
      title: 'Performance Visualization',
      content: 'View your equity curve or drawdown chart to visualize performance over time.',
      position: 'top'
    },
    {
      target: '.monte-carlo-chart',
      title: 'Monte Carlo Simulation',
      content: 'See potential future outcomes based on your strategy\'s historical performance.',
      position: 'top'
    },
    {
      target: '.parameter-section',
      title: 'Parameter Optimization',
      content: 'Explore how different parameters affect your strategy\'s performance.',
      position: 'top'
    },
    {
      target: '.dashboard-customizer',
      title: 'Customize Your Dashboard',
      content: 'Personalize your view by showing only the sections that matter to you.',
      position: 'left'
    }
  ];

  // Find and highlight the current target element
  useEffect(() => {
    if (!isActive) return;

    const targetSelector = tourSteps[currentStep].target;
    const element = document.querySelector(targetSelector) as HTMLElement;
    
    if (element) {
      setHighlightElement(element);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return () => {
      setHighlightElement(null);
    };
  }, [currentStep, isActive, tourSteps]);

  // Handle next and previous step navigation
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive) return null;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!highlightElement) return {};
    
    const rect = highlightElement.getBoundingClientRect();
    const position = tourSteps[currentStep].position;
    
    const baseStyle = {
      position: 'absolute',
      zIndex: 1000,
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          left: `${rect.left + (rect.width / 2) - 150}px`,
          bottom: `${window.innerHeight - rect.top + 10}px`,
        };
      case 'right':
        return {
          ...baseStyle,
          left: `${rect.right + 10}px`,
          top: `${rect.top + (rect.height / 2) - 75}px`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          left: `${rect.left + (rect.width / 2) - 150}px`,
          top: `${rect.bottom + 10}px`,
        };
      case 'left':
        return {
          ...baseStyle,
          right: `${window.innerWidth - rect.left + 10}px`,
          top: `${rect.top + (rect.height / 2) - 75}px`,
        };
      default:
        return baseStyle;
    }
  };

  // Calculate highlight style
  const getHighlightStyle = () => {
    if (!highlightElement) return {};
    
    const rect = highlightElement.getBoundingClientRect();
    
    return {
      position: 'absolute',
      top: `${rect.top - 5}px`,
      left: `${rect.left - 5}px`,
      width: `${rect.width + 10}px`,
      height: `${rect.height + 10}px`,
      zIndex: 999,
      boxShadow: '0 0 0 5000px rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      pointerEvents: 'none',
    };
  };

  return (
    <div className="guided-tour">
      {/* Overlay */}
      <div className="tour-overlay"></div>
      
      {/* Highlight */}
      {highlightElement && (
        <div className="tour-highlight" style={getHighlightStyle()}></div>
      )}
      
      {/* Tooltip */}
      <div className="tour-tooltip" style={getTooltipStyle()}>
        <div className="tour-tooltip-header">
          <h4>{tourSteps[currentStep].title}</h4>
          <button className="tour-close" onClick={onSkip}>×</button>
        </div>
        <div className="tour-tooltip-content">
          <p>{tourSteps[currentStep].content}</p>
        </div>
        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <div className="tour-buttons">
            {currentStep > 0 && (
              <button className="tour-btn-prev" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="tour-btn-next" onClick={handleNext}>
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour; 