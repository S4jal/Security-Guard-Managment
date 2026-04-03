import React from 'react';

function Navbar({ onToggleSidebar, onLogout }) {
  const userName = localStorage.getItem('userName') || 'Admin';

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
          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{userName}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
