import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function CompanyDashboard() {
  const [guardCount, setGuardCount] = useState(0);

  useEffect(() => {
    async function fetchGuards() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'guard');
        if (data) setGuardCount(data.length);
      } catch (err) {
        console.error('Error:', err);
      }
    }
    fetchGuards();
  }, []);

  const stats = [
    { label: 'Total Guards', value: guardCount || '48', icon: '&#128694;', color: 'blue' },
    { label: 'Active Sites', value: '12', icon: '&#127970;', color: 'green' },
    { label: 'Total Clients', value: '8', icon: '&#129309;', color: 'purple' },
    { label: 'Monthly Revenue', value: '৳4.2L', icon: '&#128176;', color: 'orange' },
  ];

  const recentContracts = [
    { client: 'Dhaka Tower Corp', guards: 8, status: 'Active', value: '৳85,000/mo' },
    { client: 'Banani Heights', guards: 5, status: 'Active', value: '৳52,000/mo' },
    { client: 'Gulshan Market Ltd', guards: 12, status: 'Active', value: '৳1,20,000/mo' },
    { client: 'Uttara Residence', guards: 4, status: 'Pending', value: '৳40,000/mo' },
    { client: 'Mirpur Industrial', guards: 6, status: 'Active', value: '৳65,000/mo' },
  ];

  const guardDistribution = [
    { zone: 'Gulshan Zone', guards: 14, percentage: 29 },
    { zone: 'Banani Zone', guards: 10, percentage: 21 },
    { zone: 'Uttara Zone', guards: 8, percentage: 17 },
    { zone: 'Dhanmondi Zone', guards: 9, percentage: 19 },
    { zone: 'Mirpur Zone', guards: 7, percentage: 14 },
  ];

  const performance = [
    { label: 'Guard Attendance', value: 94, color: 'green' },
    { label: 'Client Satisfaction', value: 92, color: 'green' },
    { label: 'Incident Response', value: 88, color: 'blue' },
    { label: 'Contract Renewal', value: 85, color: 'blue' },
  ];

  return (
    <div className="dashboard company-dashboard">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <span className="role-tag company">Management</span>
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
          <h2>&#128203; Recent Contracts</h2>
          <div className="contract-table">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Guards</th>
                  <th>Status</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {recentContracts.map((contract, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{contract.client}</td>
                    <td>{contract.guards}</td>
                    <td>
                      <span className={`status-badge ${contract.status === 'Active' ? 'on-duty' : 'on-leave'}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{contract.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>&#128205; Guard Distribution</h2>
          <div className="distribution-list">
            {guardDistribution.map((zone, index) => (
              <div className="dist-bar-item" key={index}>
                <div className="dist-bar-header">
                  <span>{zone.zone}</span>
                  <span>{zone.guards} guards</span>
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill blue"
                    style={{ width: `${zone.percentage * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h2>&#128200; Performance Overview</h2>
        <div className="performance-grid">
          {performance.map((item, index) => (
            <div className="performance-item" key={index}>
              <div className="performance-circle">
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={item.color === 'green' ? '#4caf50' : '#2196f3'}
                    strokeWidth="3"
                    strokeDasharray={`${item.value}, 100`}
                  />
                </svg>
                <span className="performance-value">{item.value}%</span>
              </div>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
