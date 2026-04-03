import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function DeveloperDashboard() {
  const [userCounts, setUserCounts] = useState({
    total: 0,
    developers: 0,
    companies: 0,
    clients: 0,
    guards: 0,
  });

  useEffect(() => {
    fetchUserCounts();
  }, []);

  async function fetchUserCounts() {
    try {
      const { data } = await supabase.from('profiles').select('role');
      if (data) {
        setUserCounts({
          total: data.length,
          developers: data.filter((u) => u.role === 'developer').length,
          companies: data.filter((u) => u.role === 'company').length,
          clients: data.filter((u) => u.role === 'client').length,
          guards: data.filter((u) => u.role === 'guard').length,
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }

  const systemStats = [
    { label: 'Total Users', value: userCounts.total || '0', icon: '&#128101;', color: 'blue' },
    { label: 'System Uptime', value: '99.9%', icon: '&#9889;', color: 'green' },
    { label: 'API Requests (24h)', value: '12.4K', icon: '&#128640;', color: 'purple' },
    { label: 'Error Rate', value: '0.02%', icon: '&#128680;', color: 'red' },
  ];

  const systemLogs = [
    { message: 'Database backup completed successfully', level: 'success', time: '5 min ago' },
    { message: 'New user registered: guard@secureguard.com', level: 'info', time: '12 min ago' },
    { message: 'SSL certificate renewed for API endpoint', level: 'success', time: '1 hour ago' },
    { message: 'Rate limit threshold reached for /api/reports', level: 'warning', time: '2 hours ago' },
    { message: 'Scheduled maintenance window completed', level: 'info', time: '3 hours ago' },
    { message: 'Failed login attempt from unknown IP', level: 'error', time: '4 hours ago' },
  ];

  const serverMetrics = [
    { name: 'CPU Usage', value: 23, color: 'green' },
    { name: 'Memory Usage', value: 58, color: 'blue' },
    { name: 'Disk Usage', value: 34, color: 'green' },
    { name: 'Network I/O', value: 12, color: 'green' },
  ];

  return (
    <div className="dashboard developer-dashboard">
      <div className="dashboard-header">
        <h1>Developer Dashboard</h1>
        <span className="role-tag developer">System Admin</span>
      </div>

      <div className="stats-grid">
        {systemStats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className={`stat-icon ${stat.color}`}>
              <span dangerouslySetInnerHTML={{ __html: stat.icon }} />
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>&#128421; Server Health</h2>
          <div className="metrics-list">
            {serverMetrics.map((metric, index) => (
              <div className="metric-item" key={index}>
                <div className="metric-header">
                  <span>{metric.name}</span>
                  <span className="metric-value">{metric.value}%</span>
                </div>
                <div className="metric-bar">
                  <div
                    className={`metric-bar-fill ${metric.color}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>&#128101; User Distribution</h2>
          <div className="user-dist-list">
            <div className="user-dist-item">
              <span className="dist-dot developer" />
              <span>Developers</span>
              <span className="dist-count">{userCounts.developers}</span>
            </div>
            <div className="user-dist-item">
              <span className="dist-dot company" />
              <span>Companies</span>
              <span className="dist-count">{userCounts.companies}</span>
            </div>
            <div className="user-dist-item">
              <span className="dist-dot client" />
              <span>Clients</span>
              <span className="dist-count">{userCounts.clients}</span>
            </div>
            <div className="user-dist-item">
              <span className="dist-dot guard" />
              <span>Guards</span>
              <span className="dist-count">{userCounts.guards}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>&#128220; System Logs</h2>
        <div className="log-list">
          {systemLogs.map((log, index) => (
            <div className={`log-item ${log.level}`} key={index}>
              <span className={`log-level ${log.level}`}>{log.level.toUpperCase()}</span>
              <span className="log-message">{log.message}</span>
              <span className="log-time">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeveloperDashboard;
