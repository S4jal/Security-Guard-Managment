import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '&#128200;' },
    { path: '/guards', label: 'Guards', icon: '&#128101;' },
    { path: '/schedule', label: 'Schedule', icon: '&#128197;' },
    { path: '/reports', label: 'Reports', icon: '&#128202;' },
  ];

  return (
    <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>
          <span>&#128737;</span> SecureGuard
        </h2>
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
