import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function getDashboardByRole(role) {
  switch (role) {
    case 'developer':
      return <DeveloperDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'client':
      return <ClientDashboard />;
    case 'guard':
      return <GuardDashboard />;
    default:
      return <GuardDashboard />;
  }
}

function AppContent() {
  const { user, role, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading SecureGuard Pro...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} role={role} />
        <div className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="page-content">
            <Routes>
              {/* Dashboard - role based */}
              <Route path="/" element={getDashboardByRole(role)} />

              {/* Developer routes */}
              {role === 'developer' && (
                <>
                  <Route path="/users" element={<Users />} />
                  <Route path="/guards" element={<Guards />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}

              {/* Company routes */}
              {role === 'company' && (
                <>
                  <Route path="/guards" element={<Guards />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}

              {/* Client routes */}
              {role === 'client' && (
                <>
                  <Route path="/my-guards" element={<Guards />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/reports" element={<Reports />} />
                </>
              )}

              {/* Guard routes */}
              {(role === 'guard' || !role) && (
                <>
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
