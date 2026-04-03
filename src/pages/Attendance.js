import React from 'react';
import { useAuth } from '../context/AuthContext';

function Attendance() {
  const { profile } = useAuth();

  const monthlyAttendance = [
    { date: 'Apr 1', checkIn: '5:55 AM', checkOut: '2:05 PM', hours: '8h 10m', status: 'Present' },
    { date: 'Apr 2', checkIn: '5:50 AM', checkOut: '2:00 PM', hours: '8h 10m', status: 'Present' },
    { date: 'Apr 3', checkIn: '1:58 PM', checkOut: '-', hours: '-', status: 'On Duty' },
    { date: 'Mar 31', checkIn: '5:52 AM', checkOut: '2:02 PM', hours: '8h 10m', status: 'Present' },
    { date: 'Mar 30', checkIn: '-', checkOut: '-', hours: '-', status: 'Day Off' },
    { date: 'Mar 29', checkIn: '5:48 AM', checkOut: '2:08 PM', hours: '8h 20m', status: 'Present' },
    { date: 'Mar 28', checkIn: '-', checkOut: '-', hours: '-', status: 'Day Off' },
    { date: 'Mar 27', checkIn: '5:55 AM', checkOut: '2:00 PM', hours: '8h 5m', status: 'Present' },
    { date: 'Mar 26', checkIn: '5:58 AM', checkOut: '2:10 PM', hours: '8h 12m', status: 'Present' },
    { date: 'Mar 25', checkIn: '6:02 AM', checkOut: '2:05 PM', hours: '8h 3m', status: 'Late' },
  ];

  const summary = [
    { label: 'Total Working Days', value: '26' },
    { label: 'Days Present', value: '24' },
    { label: 'Days Absent', value: '0' },
    { label: 'Late Arrivals', value: '2' },
    { label: 'Overtime Hours', value: '4h 30m' },
    { label: 'Leave Taken', value: '2 days' },
  ];

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>My Attendance</h1>
        <span className="role-tag guard">{profile?.full_name || 'Guard'}</span>
      </div>

      <div className="stats-grid" style={{ marginBottom: '25px' }}>
        {summary.map((item, index) => (
          <div className="stat-card" key={index} style={{ padding: '18px 22px' }}>
            <div className="stat-info">
              <h3 style={{ fontSize: '1.3rem' }}>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="guards-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {monthlyAttendance.map((record, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 500 }}>{record.date}</td>
                <td>{record.checkIn}</td>
                <td>{record.checkOut}</td>
                <td>{record.hours}</td>
                <td>
                  <span
                    className={`status-badge ${
                      record.status === 'Present' || record.status === 'On Duty'
                        ? 'on-duty'
                        : record.status === 'Late'
                        ? 'on-leave'
                        : 'off-duty'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
