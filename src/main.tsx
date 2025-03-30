import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Make sure the DOM is fully loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }
    
    // Add a small delay to ensure CSS is loaded
    setTimeout(() => {
      const root = createRoot(rootElement);
      
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      
      console.log("React app mounted successfully");
    }, 100);
  } catch (error) {
    console.error("Error rendering React app:", error);
  }
});
