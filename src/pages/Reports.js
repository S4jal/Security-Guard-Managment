import React from 'react';

function Reports() {
  const reports = [
    {
      title: 'Attendance Rate',
      value: '94%',
      percentage: 94,
      color: 'green',
      description: 'Overall attendance this month',
    },
    {
      title: 'Incidents Resolved',
      value: '87%',
      percentage: 87,
      color: 'blue',
      description: 'Incidents resolved within SLA',
    },
    {
      title: 'Patrol Completion',
      value: '91%',
      percentage: 91,
      color: 'green',
      description: 'Patrol routes completed on time',
    },
    {
      title: 'Equipment Status',
      value: '78%',
      percentage: 78,
      color: 'orange',
      description: 'Equipment in working condition',
    },
    {
      title: 'Training Compliance',
      value: '85%',
      percentage: 85,
      color: 'blue',
      description: 'Guards completed required training',
    },
    {
      title: 'Client Satisfaction',
      value: '92%',
      percentage: 92,
      color: 'green',
      description: 'Based on monthly client surveys',
    },
  ];

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <button className="add-btn">Export Report</button>
      </div>

      <div className="report-cards">
        {reports.map((report, index) => (
          <div className="report-card" key={index}>
            <h3>{report.title}</h3>
            <div className="report-bar">
              <div
                className={`report-bar-fill ${report.color}`}
                style={{ width: `${report.percentage}%` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1a2e' }}>
                {report.value}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#999' }}>
                {report.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
