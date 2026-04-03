import React from 'react';

function Schedule() {
  const shifts = [
    { type: 'morning', title: 'Morning Shift', time: '6:00 AM - 2:00 PM', guards: ['Rafiq Ahmed', 'Sohel Rana', 'Mizanur Rahman'], zones: 'Gate A, Zone A, Parking' },
    { type: 'evening', title: 'Evening Shift', time: '2:00 PM - 10:00 PM', guards: ['Kamal Hossain', 'Alamgir Kabir', 'Farid Hasan'], zones: 'Zone C, Gate C, Zone D' },
    { type: 'night', title: 'Night Shift', time: '10:00 PM - 6:00 AM', guards: ['Jahangir Alam', 'Nasir Uddin'], zones: 'Zone B, Gate B' },
    { type: 'morning', title: 'Weekend Morning', time: '6:00 AM - 2:00 PM', guards: ['Sohel Rana', 'Alamgir Kabir'], zones: 'Gate A, Zone A' },
    { type: 'evening', title: 'Weekend Evening', time: '2:00 PM - 10:00 PM', guards: ['Rafiq Ahmed', 'Mizanur Rahman'], zones: 'Parking, Zone C' },
    { type: 'night', title: 'Weekend Night', time: '10:00 PM - 6:00 AM', guards: ['Kamal Hossain', 'Farid Hasan'], zones: 'Gate B, Zone D' },
  ];

  const borderColor = { morning: 'border-l-amber-400', evening: 'border-l-blue-400', night: 'border-l-purple-400' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Shift Schedule</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Create Shift</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts.map((s, i) => (
          <div key={i} className={`bg-white rounded-xl p-5 border border-gray-100 border-l-4 ${borderColor[s.type]}`}>
            <h3 className="font-semibold text-gray-800 mb-3">{s.title}</h3>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium text-gray-600">Time:</span> {s.time}</p>
            <p className="text-sm text-gray-500 mb-1"><span className="font-medium text-gray-600">Guards:</span> {s.guards.join(', ')}</p>
            <p className="text-sm text-gray-500"><span className="font-medium text-gray-600">Zones:</span> {s.zones}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
