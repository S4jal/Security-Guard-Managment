import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function CompanyDashboard() {
  const [guardCount, setGuardCount] = useState(0);
  useEffect(() => {
    (async () => {
      try { const { data } = await supabase.from('profiles').select('id').eq('role', 'guard'); if (data) setGuardCount(data.length); } catch (e) {}
    })();
  }, []);

  const stats = [
    { label: 'Total Guards', value: guardCount || '48', icon: '&#128694;', bg: 'bg-blue-50 text-blue-500' },
    { label: 'Active Sites', value: '12', icon: '&#127970;', bg: 'bg-emerald-50 text-emerald-500' },
    { label: 'Total Clients', value: '8', icon: '&#129309;', bg: 'bg-purple-50 text-purple-500' },
    { label: 'Monthly Revenue', value: '৳4.2L', icon: '&#128176;', bg: 'bg-amber-50 text-amber-500' },
  ];

  const contracts = [
    { client: 'Dhaka Tower Corp', guards: 8, status: 'Active', value: '৳85,000/mo' },
    { client: 'Banani Heights', guards: 5, status: 'Active', value: '৳52,000/mo' },
    { client: 'Gulshan Market Ltd', guards: 12, status: 'Active', value: '৳1,20,000/mo' },
    { client: 'Uttara Residence', guards: 4, status: 'Pending', value: '৳40,000/mo' },
    { client: 'Mirpur Industrial', guards: 6, status: 'Active', value: '৳65,000/mo' },
  ];

  const zones = [
    { zone: 'Gulshan', guards: 14, pct: 29 }, { zone: 'Banani', guards: 10, pct: 21 },
    { zone: 'Uttara', guards: 8, pct: 17 }, { zone: 'Dhanmondi', guards: 9, pct: 19 },
    { zone: 'Mirpur', guards: 7, pct: 14 },
  ];

  const perf = [
    { label: 'Attendance', value: 94 }, { label: 'Satisfaction', value: 92 },
    { label: 'Response Time', value: 88 }, { label: 'Renewal Rate', value: 85 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Company Dashboard</h1>
        <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">Management</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg}`} dangerouslySetInnerHTML={{ __html: s.icon }} />
            <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Contracts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-3">Client</th><th className="pb-3">Guards</th><th className="pb-3">Status</th><th className="pb-3">Value</th>
              </tr></thead>
              <tbody>
                {contracts.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 font-medium text-gray-700">{c.client}</td>
                    <td className="py-3 text-gray-500">{c.guards}</td>
                    <td className="py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span></td>
                    <td className="py-3 font-semibold text-gray-700">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Guard Distribution</h2>
          <div className="space-y-4">
            {zones.map((z, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">{z.zone}</span><span className="text-gray-600 font-medium">{z.guards}</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${z.pct * 3}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Performance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {perf.map((p, i) => (
            <div key={i} className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={p.value >= 90 ? '#10b981' : '#6366f1'} strokeWidth="3" strokeDasharray={`${p.value} 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">{p.value}%</span>
              </div>
              <p className="text-xs text-gray-400">{p.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
