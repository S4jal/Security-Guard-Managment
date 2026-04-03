import React from 'react';
import { useAuth } from '../context/AuthContext';

function ClientDashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: 'Assigned Guards', value: '6', icon: '&#128694;', color: 'blue' },
    { label: 'Active Shifts', value: '4', icon: '&#9989;', color: 'green' },
    { label: 'Incidents This Month', value: '2', icon: '&#9888;', color: 'orange' },
    { label: 'Satisfaction Score', value: '4.8', icon: '&#11088;', color: 'purple' },
  ];

  const myGuards = [
    { name: 'Rafiq Ahmed', zone: 'Main Gate', shift: 'Morning', status: 'on-duty', phone: '01711-234567' },
    { name: 'Kamal Hossain', zone: 'Parking Area', shift: 'Morning', status: 'on-duty', phone: '01812-345678' },
    { name: 'Sohel Rana', zone: 'Building Lobby', shift: 'Evening', status: 'off-duty', phone: '01515-678901' },
    { name: 'Mizanur Rahman', zone: 'Back Gate', shift: 'Evening', status: 'off-duty', phone: '01716-789012' },
    { name: 'Alamgir Kabir', zone: 'Perimeter', shift: 'Night', status: 'off-duty', phone: '01918-901234' },
    { name: 'Farid Hasan', zone: 'Main Gate', shift: 'Night', status: 'off-duty', phone: '01817-890123' },
  ];

  const recentIncidents = [
    {
      title: 'Unauthorized Vehicle Entry Attempt',
      location: 'Main Gate',
      date: 'Apr 2, 2026',
      status: 'Resolved',
      guard: 'Rafiq Ahmed',
    },
    {
      title: 'Suspicious Activity - Parking Level 2',
      location: 'Parking Area',
      date: 'Mar 28, 2026',
      status: 'Resolved',
      guard: 'Kamal Hossain',
    },
    {
      title: 'Fire Alarm False Trigger - 3rd Floor',
      location: 'Building',
      date: 'Mar 20, 2026',
      status: 'Resolved',
      guard: 'Sohel Rana',
    },
  ];

  const serviceSummary = [
    { label: '24/7 Coverage', value: 'Active', good: true },
    { label: 'CCTV Monitoring', value: 'Active', good: true },
    { label: 'Patrol Frequency', value: 'Every 30 min', good: true },
    { label: 'Next Review Date', value: 'Apr 15, 2026', good: true },
    { label: 'Contract Expiry', value: 'Dec 31, 2026', good: true },
  ];

  const getInitials = (name) => name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="dashboard client-dashboard">
      <div className="dashboard-header">
        <h1>Client Dashboard</h1>
        <span className="role-tag client">
          {profile?.company_name || 'Client Portal'}
        </span>
      </div>

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
          <h2>&#128694; My Assigned Guards</h2>
          <div className="guard-list">
            {myGuards.map((guard, index) => (
              <div className="guard-list-item" key={index}>
                <div className="guard-list-left">
                  <div className="guard-avatar">{getInitials(guard.name)}</div>
                  <div>
                    <div className="guard-list-name">{guard.name}</div>
                    <div className="guard-list-detail">
                      {guard.zone} &middot; {guard.shift} Shift
                    </div>
                  </div>
                </div>
                <span className={`status-badge ${guard.status}`}>
                  {guard.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>&#128203; Service Summary</h2>
          <div className="service-list">
            {serviceSummary.map((item, index) => (
              <div className="service-item" key={index}>
                <span>{item.label}</span>
                <span className={`service-value ${item.good ? 'good' : ''}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '25px' }}>
            <h2>&#9888; Recent Incidents</h2>
            <div className="incident-list" style={{ marginTop: '15px' }}>
              {recentIncidents.map((incident, index) => (
                <div className="incident-item" key={index}>
                  <div className="incident-title">{incident.title}</div>
                  <div className="incident-meta">
                    {incident.location} &middot; {incident.date} &middot; {incident.guard}
                  </div>
                  <span className="status-badge on-duty">{incident.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
