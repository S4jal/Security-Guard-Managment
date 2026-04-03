import React from 'react';

function Dashboard() {
  const stats = [
    { label: 'Total Guards', value: '48', icon: '&#128101;', color: 'blue' },
    { label: 'On Duty', value: '32', icon: '&#9989;', color: 'green' },
    { label: 'On Leave', value: '5', icon: '&#128197;', color: 'orange' },
    { label: 'Incidents Today', value: '3', icon: '&#9888;', color: 'red' },
  ];

  const recentActivities = [
    { text: 'Rafiq Ahmed checked in at Gate A', time: '2 min ago' },
    { text: 'Shift change completed - Zone B', time: '15 min ago' },
    { text: 'Incident report filed - Parking Area', time: '45 min ago' },
    { text: 'Kamal Hossain started patrol - Zone C', time: '1 hour ago' },
    { text: 'Monthly attendance report generated', time: '2 hours ago' },
  ];

  const dutyStatus = [
    { name: 'Rafiq Ahmed', status: 'on-duty', zone: 'Gate A' },
    { name: 'Kamal Hossain', status: 'on-duty', zone: 'Zone C' },
    { name: 'Jahangir Alam', status: 'off-duty', zone: '-' },
    { name: 'Nasir Uddin', status: 'on-leave', zone: '-' },
    { name: 'Sohel Rana', status: 'on-duty', zone: 'Zone A' },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        {stats.map((stat, index) => (
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
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            {recentActivities.map((activity, index) => (
              <li key={index}>
                <span>{activity.text}</span>
                <span className="activity-time">{activity.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Guard Status</h2>
          <ul className="activity-list">
            {dutyStatus.map((guard, index) => (
              <li key={index}>
                <span>{guard.name}</span>
                <span className={`status-badge ${guard.status}`}>
                  {guard.status.replace('-', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
