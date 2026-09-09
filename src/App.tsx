import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Single continuous scrollable landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth Route */}
          <Route path="/login" element={<AuthPage />} />

          {/* Dedicated Chat Application Route */}
          <Route path="/chat" element={<ChatPage />} />
          
          {/* Telemetry Dashboard Route */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
