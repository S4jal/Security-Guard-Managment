import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Login from './pages/Login';
import DeveloperDashboard from './pages/DeveloperDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import ClientDashboard from './pages/ClientDashboard';
import GuardDashboard from './pages/GuardDashboard';
import Guards from './pages/Guards';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Incidents from './pages/Incidents';
import PatrolLog from './pages/PatrolLog';
import Attendance from './pages/Attendance';
import CommandCenter from './pages/CommandCenter';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function getDashboardByRole(role) {
  switch (role) {
    case 'developer': return <DeveloperDashboard />;
    case 'company': return <CompanyDashboard />;
    case 'client': return <ClientDashboard />;
    case 'guard': return <GuardDashboard />;
    default: return <GuardDashboard />;
  }
}

function AppContent() {
  const { user, role, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin-slow" />
        <p className="text-gray-400 text-sm">Loading SecureGuard Pro...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar isOpen={sidebarOpen} role={role} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="p-6">
            <Routes>
              <Route path="/" element={getDashboardByRole(role)} />
              {role === 'developer' && (
                <>
                  <Route path="/users" element={<Users />} />
                  <Route path="/guards" element={<Guards />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </>
              )}
              {role === 'company' && (
                <>
                  <Route path="/guards" element={<Guards />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}
              {role === 'client' && (
                <>
                  <Route path="/my-guards" element={<Guards />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}
              {(role === 'guard' || !role) && (
                <>
                  <Route path="/command-center" element={<CommandCenter />} />
                  <Route path="/my-schedule" element={<Schedule />} />
                  <Route path="/patrol" element={<PatrolLog />} />
                  <Route path="/attendance" element={<Attendance />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
