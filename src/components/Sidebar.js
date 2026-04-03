import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navConfig = {
  developer: [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/users', label: 'All Users', icon: '&#128101;' },
    { path: '/guards', label: 'Guards', icon: '&#128694;' },
    { path: '/schedule', label: 'Schedule', icon: '&#128197;' },
    { path: '/reports', label: 'Reports', icon: '&#128202;' },
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
    { path: '/my-schedule', label: 'My Schedule', icon: '&#128197;' },
    { path: '/patrol', label: 'Patrol Log', icon: '&#128206;' },
    { path: '/attendance', label: 'Attendance', icon: '&#9989;' },
  ],
};

const roleLabels = {
  developer: 'Developer Panel',
  company: 'Company Panel',
  client: 'Client Portal',
  guard: 'Guard Portal',
};

function Sidebar({ isOpen, role }) {
  const location = useLocation();
  const navItems = navConfig[role] || navConfig.guard;
  const roleLabel = roleLabels[role] || 'Portal';

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>
          <span>&#128737;</span> SecureGuard
        </h2>
        <span className={`sidebar-role-badge ${role}`}>{roleLabel}</span>
      </div>
      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span
                className="nav-icon"
                dangerouslySetInnerHTML={{ __html: item.icon }}
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
