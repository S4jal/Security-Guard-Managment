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
  const { profile } = useAuth();
  const { settings } = useSettings();
  const navItems = navConfig[role] || navConfig.guard;
  const userName = profile?.full_name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isGuard = role === 'guard' || !role;

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 flex flex-col overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-64'}`}
      style={{ background: isGuard ? '#0b1929' : '#fff', borderRight: isGuard ? 'none' : '1px solid #f0f0f0' }}
    >
      {/* Profile Section (guard gets dark avatar section) */}
      {isGuard ? (
        <div style={{ padding: '32px 24px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: 16, margin: '0 auto 16px',
            background: '#1a2d42', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#667',
            border: '3px solid #253a50',
          }}>
            {initials}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#e0e0e0', marginBottom: 8 }}>{userName}</p>
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', background: '#f59e0b', color: '#fff',
            padding: '4px 12px', borderRadius: 6,
          }}>
            {roleLabels.guard}
          </span>
        </div>
      ) : (
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
            background: role === 'developer' ? '#fce4ec' : role === 'company' ? '#e3f2fd' : '#fff3e0',
            color: role === 'developer' ? '#e91e63' : role === 'company' ? '#2196f3' : '#ff9800',
          }}>
            {roleLabels[role] || 'Portal'}
          </span>
        </div>
      )}

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
                ...(isGuard
                  ? {
                      color: active ? '#f59e0b' : '#8899aa',
                      background: active ? 'rgba(245,158,11,0.08)' : 'transparent',
                    }
                  : {
                      color: active ? '#4f46e5' : '#888',
                      background: active ? '#eef2ff' : 'transparent',
                    }
                ),
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
