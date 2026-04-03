import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); if (data) setUsers(data); } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const roleColor = { developer: 'bg-pink-50 text-pink-600', company: 'bg-blue-50 text-blue-600', client: 'bg-amber-50 text-amber-600', guard: 'bg-emerald-50 text-emerald-600' };
  const avatarColor = { developer: 'bg-pink-100 text-pink-600', company: 'bg-blue-100 text-blue-600', client: 'bg-amber-100 text-amber-600', guard: 'bg-emerald-100 text-emerald-600' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">All Users</h1>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition">+ Add User</button>
      </div>
      {loading ? <p className="text-center py-16 text-gray-400">Loading users...</p> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Joined</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5"><div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor[u.role] || 'bg-gray-100 text-gray-500'}`}>{(u.full_name || '?')[0].toUpperCase()}</div>
                    <span className="font-medium text-gray-700">{u.full_name || 'Unnamed'}</span>
                  </div></td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5"><span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleColor[u.role] || 'bg-gray-100 text-gray-500'}`}>{u.role}</span></td>
                  <td className="px-5 py-3.5 text-gray-400">{u.phone || '-'}</td>
                  <td className="px-5 py-3.5 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="5" className="text-center py-12 text-gray-400">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;
