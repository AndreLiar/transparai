//src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext';
import './i18n';
import { ThemeProvider } from '@/context/ThemeContext';
import { initAppInsights } from '@/config/appInsights';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Initialise Application Insights before the React tree renders
initAppInsights();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
