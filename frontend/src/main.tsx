//src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext';
import './i18n'; // add this at the top
import { ThemeProvider } from '@/context/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
