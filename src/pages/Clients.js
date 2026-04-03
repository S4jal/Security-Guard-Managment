import React from 'react';

function Clients() {
  const clients = [
    { id: 'CL-001', name: 'Dhaka Tower Corp', contact: 'Mr. Rahman', phone: '01711-111111', sites: 3, guards: 8, status: 'Active' },
    { id: 'CL-002', name: 'Banani Heights', contact: 'Ms. Fatema', phone: '01812-222222', sites: 1, guards: 5, status: 'Active' },
    { id: 'CL-003', name: 'Gulshan Market Ltd', contact: 'Mr. Karim', phone: '01913-333333', sites: 4, guards: 12, status: 'Active' },
    { id: 'CL-004', name: 'Uttara Residence', contact: 'Mr. Islam', phone: '01614-444444', sites: 2, guards: 4, status: 'Pending' },
    { id: 'CL-005', name: 'Mirpur Industrial', contact: 'Mr. Haque', phone: '01515-555555', sites: 2, guards: 6, status: 'Active' },
    { id: 'CL-006', name: 'Motijheel Complex', contact: 'Ms. Akter', phone: '01716-666666', sites: 1, guards: 3, status: 'Active' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Clients</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Add Client</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
            <th className="px-5 py-4">ID</th><th className="px-5 py-4">Company</th><th className="px-5 py-4">Contact</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Sites</th><th className="px-5 py-4">Guards</th><th className="px-5 py-4">Status</th>
          </tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{c.id}</td>
                <td className="px-5 py-3.5 font-medium text-gray-700">{c.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.contact}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.phone}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.sites}</td>
                <td className="px-5 py-3.5 text-gray-500">{c.guards}</td>
                <td className="px-5 py-3.5"><span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clients;
