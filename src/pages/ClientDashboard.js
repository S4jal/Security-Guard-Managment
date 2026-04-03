import React from 'react';
import { useAuth } from '../context/AuthContext';

function ClientDashboard() {
  const { profile } = useAuth();
  const stats = [
    { label: 'Assigned Guards', value: '6', icon: '&#128694;', bg: 'bg-blue-50 text-blue-500' },
    { label: 'Active Shifts', value: '4', icon: '&#9989;', bg: 'bg-emerald-50 text-emerald-500' },
    { label: 'Incidents', value: '2', icon: '&#9888;', bg: 'bg-amber-50 text-amber-500' },
    { label: 'Satisfaction', value: '4.8', icon: '&#11088;', bg: 'bg-purple-50 text-purple-500' },
  ];

  const guards = [
    { name: 'Rafiq Ahmed', zone: 'Main Gate', shift: 'Morning', status: 'on-duty' },
    { name: 'Kamal Hossain', zone: 'Parking', shift: 'Morning', status: 'on-duty' },
    { name: 'Sohel Rana', zone: 'Lobby', shift: 'Evening', status: 'off-duty' },
    { name: 'Mizanur Rahman', zone: 'Back Gate', shift: 'Evening', status: 'off-duty' },
    { name: 'Alamgir Kabir', zone: 'Perimeter', shift: 'Night', status: 'off-duty' },
    { name: 'Farid Hasan', zone: 'Main Gate', shift: 'Night', status: 'off-duty' },
  ];

  const incidents = [
    { title: 'Unauthorized Vehicle Entry Attempt', location: 'Main Gate', date: 'Apr 2', guard: 'Rafiq Ahmed' },
    { title: 'Suspicious Activity - Parking Level 2', location: 'Parking', date: 'Mar 28', guard: 'Kamal Hossain' },
    { title: 'Fire Alarm False Trigger', location: '3rd Floor', date: 'Mar 20', guard: 'Sohel Rana' },
  ];

  const services = [
    { label: '24/7 Coverage', value: 'Active' }, { label: 'CCTV Monitoring', value: 'Active' },
    { label: 'Patrol Frequency', value: 'Every 30 min' }, { label: 'Next Review', value: 'Apr 15, 2026' },
    { label: 'Contract Expiry', value: 'Dec 31, 2026' },
  ];

  const statusStyle = { 'on-duty': 'bg-emerald-50 text-emerald-600', 'off-duty': 'bg-gray-100 text-gray-500' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Client Dashboard</h1>
        <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-3 py-1 rounded-lg">{profile?.company_name || 'Client Portal'}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg}`} dangerouslySetInnerHTML={{ __html: s.icon }} />
            <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Assigned Guards</h2>
          <div className="space-y-2">
            {guards.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {g.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{g.name}</p>
                    <p className="text-xs text-gray-400">{g.zone} &middot; {g.shift}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyle[g.status]}`}>{g.status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Service Summary</h2>
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-400">{s.label}</span>
                  <span className="font-medium text-emerald-600">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Incidents</h2>
            <div className="space-y-3">
              {incidents.map((inc, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                  <p className="text-sm font-medium text-gray-700">{inc.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{inc.location} &middot; {inc.date} &middot; {inc.guard}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
