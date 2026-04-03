import React from 'react';

function Incidents() {
  const incidents = [
    { id: 'INC-041', title: 'Unauthorized Vehicle Entry Attempt', location: 'Main Gate', date: 'Apr 2, 2026', by: 'Rafiq Ahmed', priority: 'High', status: 'Resolved', desc: 'Unknown vehicle attempted entry without authorization. Guard stopped and verified.' },
    { id: 'INC-040', title: 'Suspicious Person Near Back Gate', location: 'Back Gate', date: 'Mar 30, 2026', by: 'Alamgir Kabir', priority: 'Medium', status: 'Resolved', desc: 'Unknown individual loitering near back gate. Guard approached and individual left.' },
    { id: 'INC-039', title: 'Fire Alarm False Trigger', location: '3rd Floor', date: 'Mar 28, 2026', by: 'Sohel Rana', priority: 'Low', status: 'Resolved', desc: 'Fire alarm triggered due to cooking smoke. No actual fire. Reset alarm.' },
    { id: 'INC-038', title: 'CCTV Camera Offline - Zone B', location: 'Zone B', date: 'Mar 25, 2026', by: 'Kamal Hossain', priority: 'Medium', status: 'Open', desc: 'Camera #7 went offline. Technician notified. Manual patrol increased.' },
    { id: 'INC-037', title: 'Theft Attempt - Parking Area', location: 'Parking L2', date: 'Mar 22, 2026', by: 'Mizanur Rahman', priority: 'High', status: 'Resolved', desc: 'Vehicle break-in attempt detected via CCTV. Guard intervened, suspect fled.' },
  ];

  const priColor = { High: 'bg-red-50 text-red-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-gray-100 text-gray-500' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Incidents</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Report Incident</button>
      </div>
      <div className="space-y-4">
        {incidents.map(inc => (
          <div key={inc.id} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs text-gray-400 font-mono">{inc.id}</span>
                <h3 className="text-sm font-semibold text-gray-800 mt-1">{inc.title}</h3>
              </div>
              <div className="flex gap-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${priColor[inc.priority]}`}>{inc.priority}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${inc.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{inc.status}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">{inc.desc}</p>
            <div className="flex gap-5 text-xs text-gray-400">
              <span>&#128205; {inc.location}</span><span>&#128197; {inc.date}</span><span>&#128100; {inc.by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Incidents;
