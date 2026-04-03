import React from 'react';

function PatrolLog() {
  const patrols = [
    { id: 'PTL-112', date: 'Apr 3, 2026', shift: 'Evening', route: 'Gate A > Parking L1 > Lobby > Fire Exit > Rooftop > Parking L2 > Gate A', cp: 6, done: 3, start: '2:10 PM', active: true },
    { id: 'PTL-111', date: 'Apr 3, 2026', shift: 'Morning', route: 'Gate A > Zone A > Back Gate > Perimeter > Gate A', cp: 5, done: 5, start: '6:15 AM', active: false },
    { id: 'PTL-110', date: 'Apr 2, 2026', shift: 'Morning', route: 'Gate A > Parking L1 > Lobby > Fire Exit > Gate A', cp: 4, done: 4, start: '6:10 AM', active: false },
    { id: 'PTL-109', date: 'Apr 1, 2026', shift: 'Morning', route: 'Gate A > Zone A > Back Gate > Perimeter > Rooftop > Gate A', cp: 6, done: 6, start: '6:20 AM', active: false },
    { id: 'PTL-108', date: 'Mar 31, 2026', shift: 'Morning', route: 'Gate A > Parking L1 > Parking L2 > Lobby > Gate A', cp: 4, done: 4, start: '6:05 AM', active: false },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Patrol Log</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Start Patrol</button>
      </div>
      <div className="space-y-4">
        {patrols.map(p => (
          <div key={p.id} className={`bg-white rounded-xl p-5 border ${p.active ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm text-gray-800">{p.id}</span>
                <span className="text-sm text-gray-400">{p.date} &middot; {p.shift}</span>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${p.active ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{p.active ? 'In Progress' : 'Completed'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{p.route}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(p.done / p.cp) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{p.done}/{p.cp}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Started: {p.start}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatrolLog;
