import React from 'react';

function Schedule() {
  const shifts = [
    {
      type: 'morning',
      title: 'Morning Shift',
      time: '6:00 AM - 2:00 PM',
      guards: ['Rafiq Ahmed', 'Sohel Rana', 'Mizanur Rahman'],
      zones: 'Gate A, Zone A, Parking',
    },
    {
      type: 'evening',
      title: 'Evening Shift',
      time: '2:00 PM - 10:00 PM',
      guards: ['Kamal Hossain', 'Alamgir Kabir', 'Farid Hasan'],
      zones: 'Zone C, Gate C, Zone D',
    },
    {
      type: 'night',
      title: 'Night Shift',
      time: '10:00 PM - 6:00 AM',
      guards: ['Jahangir Alam', 'Nasir Uddin'],
      zones: 'Zone B, Gate B',
    },
    {
      type: 'morning',
      title: 'Weekend Morning',
      time: '6:00 AM - 2:00 PM',
      guards: ['Sohel Rana', 'Alamgir Kabir'],
      zones: 'Gate A, Zone A',
    },
    {
      type: 'evening',
      title: 'Weekend Evening',
      time: '2:00 PM - 10:00 PM',
      guards: ['Rafiq Ahmed', 'Mizanur Rahman'],
      zones: 'Parking, Zone C',
    },
    {
      type: 'night',
      title: 'Weekend Night',
      time: '10:00 PM - 6:00 AM',
      guards: ['Kamal Hossain', 'Farid Hasan'],
      zones: 'Gate B, Zone D',
    },
  ];

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1>Shift Schedule</h1>
        <button className="add-btn">+ Create Shift</button>
      </div>

      <div className="schedule-grid">
        {shifts.map((shift, index) => (
          <div className={`shift-card ${shift.type}`} key={index}>
            <h3>{shift.title}</h3>
            <p><strong>Time:</strong> {shift.time}</p>
            <p><strong>Guards:</strong> {shift.guards.join(', ')}</p>
            <p><strong>Zones:</strong> {shift.zones}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
