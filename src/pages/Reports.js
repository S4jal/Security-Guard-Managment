import React from 'react';

function Reports() {
  const reports = [
    { title: 'Attendance Rate', value: '94%', pct: 94, color: 'bg-emerald-500' },
    { title: 'Incidents Resolved', value: '87%', pct: 87, color: 'bg-blue-500' },
    { title: 'Patrol Completion', value: '91%', pct: 91, color: 'bg-emerald-500' },
    { title: 'Equipment Status', value: '78%', pct: 78, color: 'bg-amber-500' },
    { title: 'Training Compliance', value: '85%', pct: 85, color: 'bg-blue-500' },
    { title: 'Client Satisfaction', value: '92%', pct: 92, color: 'bg-emerald-500' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Reports & Analytics</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">Export Report</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{r.title}</h3>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-800">{r.value}</span>
              <span className="text-xs text-gray-400">{r.title.toLowerCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
