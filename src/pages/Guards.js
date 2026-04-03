import React from 'react';

function Guards() {
  const guards = [
    { id: 'SG-001', name: 'Rafiq Ahmed', phone: '01711-234567', zone: 'Gate A', status: 'on-duty', joinDate: '2023-01-15' },
    { id: 'SG-002', name: 'Kamal Hossain', phone: '01812-345678', zone: 'Zone C', status: 'on-duty', joinDate: '2023-03-20' },
    { id: 'SG-003', name: 'Jahangir Alam', phone: '01913-456789', zone: 'Zone B', status: 'off-duty', joinDate: '2022-11-10' },
    { id: 'SG-004', name: 'Nasir Uddin', phone: '01614-567890', zone: 'Gate B', status: 'on-leave', joinDate: '2023-06-01' },
    { id: 'SG-005', name: 'Sohel Rana', phone: '01515-678901', zone: 'Zone A', status: 'on-duty', joinDate: '2022-08-15' },
    { id: 'SG-006', name: 'Mizanur Rahman', phone: '01716-789012', zone: 'Parking', status: 'on-duty', joinDate: '2023-02-28' },
    { id: 'SG-007', name: 'Farid Hasan', phone: '01817-890123', zone: 'Zone D', status: 'off-duty', joinDate: '2023-09-12' },
    { id: 'SG-008', name: 'Alamgir Kabir', phone: '01918-901234', zone: 'Gate C', status: 'on-duty', joinDate: '2022-05-20' },
  ];

  const badge = { 'on-duty': 'bg-emerald-50 text-emerald-600', 'off-duty': 'bg-gray-100 text-gray-500', 'on-leave': 'bg-amber-50 text-amber-600' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Security Guards</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Add Guard</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
            <th className="px-5 py-4">ID</th><th className="px-5 py-4">Name</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Zone</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th>
          </tr></thead>
          <tbody>
            {guards.map(g => (
              <tr key={g.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{g.id}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{g.name.split(' ').map(n => n[0]).join('')}</div>
                    <span className="font-medium text-gray-700">{g.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{g.phone}</td>
                <td className="px-5 py-3.5 text-gray-500">{g.zone}</td>
                <td className="px-5 py-3.5"><span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badge[g.status]}`}>{g.status.replace('-', ' ')}</span></td>
                <td className="px-5 py-3.5 text-gray-400">{g.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Guards;
