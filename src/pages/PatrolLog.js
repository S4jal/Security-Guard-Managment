import React from 'react';

function PatrolLog() {
  const patrols = [
    {
      id: 'PTL-112',
      date: 'Apr 3, 2026',
      shift: 'Evening',
      route: 'Gate A → Parking L1 → Lobby → Fire Exit → Rooftop → Parking L2 → Gate A',
      checkpoints: 6,
      completed: 3,
      startTime: '2:10 PM',
      status: 'In Progress',
    },
    {
      id: 'PTL-111',
      date: 'Apr 3, 2026',
      shift: 'Morning',
      route: 'Gate A → Zone A → Back Gate → Perimeter → Gate A',
      checkpoints: 5,
      completed: 5,
      startTime: '6:15 AM',
      status: 'Completed',
    },
    {
      id: 'PTL-110',
      date: 'Apr 2, 2026',
      shift: 'Morning',
      route: 'Gate A → Parking L1 → Lobby → Fire Exit → Gate A',
      checkpoints: 4,
      completed: 4,
      startTime: '6:10 AM',
      status: 'Completed',
    },
    {
      id: 'PTL-109',
      date: 'Apr 1, 2026',
      shift: 'Morning',
      route: 'Gate A → Zone A → Back Gate → Perimeter → Rooftop → Gate A',
      checkpoints: 6,
      completed: 6,
      startTime: '6:20 AM',
      status: 'Completed',
    },
    {
      id: 'PTL-108',
      date: 'Mar 31, 2026',
      shift: 'Morning',
      route: 'Gate A → Parking L1 → Parking L2 → Lobby → Gate A',
      checkpoints: 4,
      completed: 4,
      startTime: '6:05 AM',
      status: 'Completed',
    },
  ];

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>Patrol Log</h1>
        <button className="add-btn">+ Start New Patrol</button>
      </div>

      <div className="patrol-cards">
        {patrols.map((patrol) => (
          <div className={`patrol-card ${patrol.status === 'In Progress' ? 'active' : ''}`} key={patrol.id}>
            <div className="patrol-card-header">
              <div>
                <span className="patrol-id">{patrol.id}</span>
                <span className="patrol-date">{patrol.date} &middot; {patrol.shift} Shift</span>
              </div>
              <span className={`status-badge ${patrol.status === 'Completed' ? 'on-duty' : 'on-leave'}`}>
                {patrol.status}
              </span>
            </div>
            <div className="patrol-route">
              <strong>Route:</strong> {patrol.route}
            </div>
            <div className="patrol-progress">
              <div className="patrol-progress-bar">
                <div
                  className="patrol-progress-fill"
                  style={{ width: `${(patrol.completed / patrol.checkpoints) * 100}%` }}
                />
              </div>
              <span className="patrol-progress-text">
                {patrol.completed}/{patrol.checkpoints} checkpoints
              </span>
            </div>
            <div className="patrol-meta">
              <span>Started: {patrol.startTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatrolLog;
