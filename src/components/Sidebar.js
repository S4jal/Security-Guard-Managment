import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const navConfig = {
  developer: [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/users', label: 'All Users', icon: '&#128101;' },
    { path: '/guards', label: 'Guards', icon: '&#128694;' },
    { path: '/schedule', label: 'Schedule', icon: '&#128197;' },
    { path: '/reports', label: 'Reports', icon: '&#128202;' },
    { path: '/settings', label: 'Settings', icon: '&#9881;' },
  ],
  company: [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/guards', label: 'Guards', icon: '&#128694;' },
    { path: '/clients', label: 'Clients', icon: '&#129309;' },
    { path: '/schedule', label: 'Schedule', icon: '&#128197;' },
    { path: '/reports', label: 'Reports', icon: '&#128202;' },
  ],
  client: [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/my-guards', label: 'My Guards', icon: '&#128694;' },
    { path: '/incidents', label: 'Incidents', icon: '&#9888;' },
    { path: '/reports', label: 'Reports', icon: '&#128202;' },
  ],
  guard: [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/command-center', label: 'Command Center', icon: '&#127919;' },
    { path: '/my-schedule', label: 'My Schedule', icon: '&#128197;' },
    { path: '/patrol', label: 'Patrol Log', icon: '&#128206;' },
    { path: '/attendance', label: 'Attendance', icon: '&#9989;' },
  ],
};

const roleBadge = {
  developer: 'bg-pink-50 text-pink-600',
  company: 'bg-blue-50 text-blue-600',
  client: 'bg-amber-50 text-amber-600',
  guard: 'bg-emerald-50 text-emerald-600',
};

const roleLabels = {
  developer: 'Developer Panel',
  company: 'Company Panel',
  client: 'Client Portal',
  guard: 'Guard Portal',
};

function Sidebar({ isOpen, role }) {
  const location = useLocation();
  const { settings } = useSettings();
  const navItems = navConfig[role] || navConfig.guard;

  return (
    <div className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 py-6 z-50 transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-64'}`}>
      {/* Header */}
      <div className="px-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-2">
          {settings.company_logo_url ? (
            <img src={settings.company_logo_url} alt="Logo" className="w-7 h-7 rounded-md object-contain" />
          ) : (
            <span className="text-xl">&#128737;</span>
          )}
          <span className="font-bold text-gray-800 text-sm">{settings.company_name || 'SecureGuard'}</span>
        </div>
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${roleBadge[role] || roleBadge.guard}`}>
          {roleLabels[role] || 'Portal'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <span className="text-base w-5 text-center" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
