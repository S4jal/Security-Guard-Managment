import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guards from './pages/Guards';
import Schedule from './pages/Schedule';
import Reports from './pages/Reports';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (email, password) => {
    if (email === 'admin@securityguard.com' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', 'Admin');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/guards" element={<Guards />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
