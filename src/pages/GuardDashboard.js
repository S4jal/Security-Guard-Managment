import React from 'react';
import { useAuth } from '../context/AuthContext';

function GuardDashboard() {
  const { profile } = useAuth();

  const stats = [
    { label: "Today's Shifts", value: '2', icon: '&#128337;', color: 'blue' },
    { label: 'Hours This Week', value: '38', icon: '&#9201;', color: 'green' },
    { label: 'Upcoming Leaves', value: '1', icon: '&#128197;', color: 'orange' },
    { label: 'Attendance Rate', value: '96%', icon: '&#9989;', color: 'purple' },
  ];

  const todaySchedule = [
    { shift: 'Morning Shift', time: '6:00 AM - 2:00 PM', zone: 'Main Gate', status: 'Completed' },
    { shift: 'Evening Shift', time: '2:00 PM - 10:00 PM', zone: 'Zone A - Perimeter', status: 'In Progress' },
  ];

  const weeklySchedule = [
    { day: 'Saturday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Sunday', shift: 'Evening', time: '2:00 PM - 10:00 PM', zone: 'Zone A' },
    { day: 'Monday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Parking Area' },
    { day: 'Tuesday', shift: 'Night', time: '10:00 PM - 6:00 AM', zone: 'Building Lobby' },
    { day: 'Wednesday', shift: 'Off', time: '-', zone: '-' },
    { day: 'Thursday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Friday', shift: 'Off', time: '-', zone: '-' },
  ];

  const patrolCheckpoints = [
    { name: 'Gate A - Main Entrance', time: '2:15 PM', checked: true },
    { name: 'Parking Level 1', time: '2:35 PM', checked: true },
    { name: 'Building Lobby', time: '2:55 PM', checked: true },
    { name: 'Fire Exit - North', time: '3:15 PM', checked: false },
    { name: 'Rooftop Access', time: '3:35 PM', checked: false },
    { name: 'Parking Level 2', time: '3:55 PM', checked: false },
  ];

  const announcements = [
    { title: 'Uniform Inspection - April 10', message: 'All guards must report in full uniform for quarterly inspection.', date: 'Apr 1' },
    { title: 'Salary Disbursement', message: 'March salary will be credited by April 5.', date: 'Mar 30' },
    { title: 'Training Session', message: 'Fire safety training scheduled for April 12 at head office.', date: 'Mar 28' },
  ];

  return (
    <div className="dashboard guard-dashboard">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <span className="role-tag guard">
          {profile?.full_name || 'Guard'}
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
          <h2>&#128197; Today's Schedule</h2>
          <div className="today-schedule">
            {todaySchedule.map((item, index) => (
              <div className={`schedule-block ${item.status === 'In Progress' ? 'active' : 'done'}`} key={index}>
                <div className="schedule-block-header">
                  <strong>{item.shift}</strong>
                  <span className={`status-badge ${item.status === 'In Progress' ? 'on-duty' : 'on-leave'}`}>
                    {item.status}
                  </span>
                </div>
                <p>&#128337; {item.time}</p>
                <p>&#128205; {item.zone}</p>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: '25px' }}>&#128467; Weekly Schedule</h2>
          <div className="weekly-table" style={{ marginTop: '15px' }}>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Shift</th>
                  <th>Time</th>
                  <th>Zone</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map((item, index) => (
                  <tr key={index} className={item.shift === 'Off' ? 'off-day' : ''}>
                    <td style={{ fontWeight: 500 }}>{item.day}</td>
                    <td>
                      <span className={`shift-type ${item.shift.toLowerCase()}`}>
                        {item.shift}
                      </span>
                    </td>
                    <td>{item.time}</td>
                    <td>{item.zone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>&#128206; Patrol Checkpoints</h2>
          <div className="checkpoint-list">
            {patrolCheckpoints.map((cp, index) => (
              <div className={`checkpoint-item ${cp.checked ? 'checked' : ''}`} key={index}>
                <div className="checkpoint-check">
                  {cp.checked ? '&#9989;' : '&#9723;'}
                </div>
                <div className="checkpoint-info">
                  <div className="checkpoint-name">{cp.name}</div>
                  <div className="checkpoint-time">Due: {cp.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '25px' }}>
            <h2>&#128227; Announcements</h2>
            <div className="announcement-list" style={{ marginTop: '15px' }}>
              {announcements.map((item, index) => (
                <div className="announcement-item" key={index}>
                  <div className="announcement-date">{item.date}</div>
                  <div>
                    <div className="announcement-title">{item.title}</div>
                    <div className="announcement-msg">{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardDashboard;
