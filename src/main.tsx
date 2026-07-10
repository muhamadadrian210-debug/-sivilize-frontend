import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

// Invisible watermark and console signature for authenticity check
if (typeof window !== 'undefined') {
  (window as any).__SIVILIZE_CORP_AUTHENTIC__ = "PT Sivilize Corp Indonesia - Verified Digital Signature - 2026";
  console.log(
    "%c🛡️ SIVILIZE HUB PRO - ECOSYSTEM %cPT Sivilize Corp Indonesia\nVerified Signature: SIV-2026-SVC-AUTH",
    "color: #ff7a00; font-weight: bold; font-size: 14px;",
    "color: #fff; font-weight: bold; font-size: 14px; background-color: #333; padding: 2px 6px; border-radius: 4px;"
  );
}

// Create root with error boundary
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  console.error('Root container not found');
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Handle global errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  event.preventDefault();
});
