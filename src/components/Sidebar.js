import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const navConfig = {
  developer: [
    { path: '/', label: 'Dashboard' },
    { path: '/users', label: 'All Users' },
    { path: '/guards', label: 'Guards' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/reports', label: 'Reports' },
    { path: '/settings', label: 'Settings' },
  ],
  company: [
    { path: '/', label: 'Dashboard' },
    { path: '/guards', label: 'Guards' },
    { path: '/clients', label: 'Clients' },
    { path: '/schedule', label: 'Schedule' },
    { path: '/reports', label: 'Reports' },
  ],
  client: [
    { path: '/', label: 'Dashboard' },
    { path: '/my-guards', label: 'My Guards' },
    { path: '/incidents', label: 'Incidents' },
    { path: '/reports', label: 'Reports' },
  ],
  guard: [
    { path: '/', label: 'Command Center' },
    { path: '/attendance-history', label: 'Attendance History' },
    { path: '/time-card', label: 'Time Card' },
    { path: '/day-off', label: 'Day Off Request' },
    { path: '/daily-report', label: 'Daily Activity Report' },
    { path: '/condition-reports', label: 'Condition Reports' },
    { path: '/patrol', label: 'Patrol Log' },
  ],
};

const roleLabels = {
  developer: 'System Admin',
  company: 'Management',
  client: 'Client Portal',
  guard: 'Authorized Personnel',
};

function Sidebar({ isOpen, role }) {
  const location = useLocation();
  useAuth();
  const { settings } = useSettings();
  const navItems = navConfig[role] || navConfig.guard;
  const isGuard = role === 'guard' || !role;

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 flex flex-col overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-64'}`}
      style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
    >
      {/* Profile Section (guard gets dark avatar section) */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {settings.company_logo_url ? (
            <img src={settings.company_logo_url} alt="Logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: 20 }}>&#128737;</span>
          )}
          <span style={{ fontWeight: 700, fontSize: 14, color: '#333' }}>{settings.company_name || 'SecureGuard'}</span>
        </div>
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
          background: isGuard ? '#ecfdf5' : role === 'developer' ? '#fce4ec' : role === 'company' ? '#e3f2fd' : '#fff3e0',
          color: isGuard ? '#10b981' : role === 'developer' ? '#e91e63' : role === 'company' ? '#2196f3' : '#ff9800',
        }}>
          {roleLabels[role] || 'Portal'}
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '11px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'all 0.15s',
                color: active ? '#4f46e5' : '#888',
                background: active ? '#eef2ff' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
