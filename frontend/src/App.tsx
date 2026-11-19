import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ModuleBackground } from './components/ModuleBackground';
import { Mic } from 'lucide-react';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { BatteryIntelligencePage } from './pages/BatteryIntelligencePage';
import { EnergyAnalyticsPage } from './pages/EnergyAnalyticsPage';
import { VehicleDiagnosticsPage } from './pages/VehicleDiagnosticsPage';
import { ChargingStationsPage } from './pages/ChargingStationsPage';
import { SmartNavigationPage } from './pages/SmartNavigationPage';
import { SmartVoicePage } from './pages/SmartVoicePage';
import { ReportsPage } from './pages/ReportsPage';
import { VehicleRegistrationPage } from './pages/VehicleRegistrationPage';
import { ProfilePage } from './pages/ProfilePage';

// Layout wrapper to show Navbar conditionally
const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Hide global navbar on landing page and auth pages
  const isAuthOrLanding = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-inherit relative">
      <ModuleBackground />
      {!isAuthOrLanding && <Navbar onOpenVoice={() => setIsVoiceOpen(true)} />}

      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/battery" element={<BatteryIntelligencePage />} />
          <Route path="/energy" element={<EnergyAnalyticsPage />} />
          <Route path="/diagnostics" element={<VehicleDiagnosticsPage />} />
          <Route path="/stations" element={<ChargingStationsPage />} />
          <Route path="/navigation" element={<SmartNavigationPage />} />
          <Route path="/smartvoice" element={<SmartVoicePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/vehicles/register" element={<VehicleRegistrationPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      {/* Floating SmartVoice Cockpit Button on Dashboard pages */}
      {!isAuthOrLanding && (
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 hover:scale-110 active:scale-95 transition group"
          title="Open EV SmartVoice Assistant"
        >
          <Mic className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
        </button>
      )}

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
