import React from 'react';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  developer: '#e91e63',
  company: '#2196f3',
  client: '#ff9800',
  guard: '#4caf50',
};

function Navbar({ onToggleSidebar }) {
  const { profile, role, logout } = useAuth();
  const userName = profile?.full_name || 'User';
  const color = roleColors[role] || '#302b63';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          &#9776;
        </button>
        <span style={{ fontSize: '0.9rem', color: '#666' }}>
          Security Guard Management System
        </span>
      </div>
      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar" style={{ background: color }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className={`user-role-badge ${role}`}>{role}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
