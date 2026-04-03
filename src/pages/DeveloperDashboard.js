import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';

function DeveloperDashboard() {
  const { settings } = useSettings();
  const [userCounts, setUserCounts] = useState({ total: 0, developers: 0, companies: 0, clients: 0, guards: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('profiles').select('role');
        if (data) setUserCounts({
          total: data.length,
          developers: data.filter(u => u.role === 'developer').length,
          companies: data.filter(u => u.role === 'company').length,
          clients: data.filter(u => u.role === 'client').length,
          guards: data.filter(u => u.role === 'guard').length,
        });
      } catch (e) {}
    })();
  }, []);

  const stats = [
    { label: 'Total Users', value: userCounts.total || '0', icon: '&#128101;', bg: 'bg-blue-50 text-blue-500' },
    { label: 'System Uptime', value: '99.9%', icon: '&#9889;', bg: 'bg-emerald-50 text-emerald-500' },
    { label: 'API Requests', value: '12.4K', icon: '&#128640;', bg: 'bg-purple-50 text-purple-500' },
    { label: 'Error Rate', value: '0.02%', icon: '&#128680;', bg: 'bg-red-50 text-red-500' },
  ];

  const logs = [
    { msg: 'Database backup completed successfully', lvl: 'success', time: '5 min ago' },
    { msg: 'New user registered: guard@secureguard.com', lvl: 'info', time: '12 min ago' },
    { msg: 'SSL certificate renewed for API endpoint', lvl: 'success', time: '1 hour ago' },
    { msg: 'Rate limit threshold reached for /api/reports', lvl: 'warning', time: '2 hours ago' },
    { msg: 'Scheduled maintenance window completed', lvl: 'info', time: '3 hours ago' },
    { msg: 'Failed login attempt from unknown IP', lvl: 'error', time: '4 hours ago' },
  ];

  const lvlStyle = { success: 'bg-emerald-50 text-emerald-600', info: 'bg-blue-50 text-blue-600', warning: 'bg-amber-50 text-amber-600', error: 'bg-red-50 text-red-600' };

  const metrics = [
    { name: 'CPU Usage', value: 23 }, { name: 'Memory Usage', value: 58 },
    { name: 'Disk Usage', value: 34 }, { name: 'Network I/O', value: 12 },
  ];

  const distItems = [
    { label: 'Developers', count: userCounts.developers, color: 'bg-pink-500' },
    { label: 'Companies', count: userCounts.companies, color: 'bg-blue-500' },
    { label: 'Clients', count: userCounts.clients, color: 'bg-amber-500' },
    { label: 'Guards', count: userCounts.guards, color: 'bg-emerald-500' },
  ];

  const smtpOk = settings.smtp_host && settings.smtp_user;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Developer Dashboard</h1>
        <span className="text-xs font-semibold bg-pink-50 text-pink-600 px-3 py-1 rounded-lg">System Admin</span>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { title: 'Company', sub: settings.company_name, icon: '&#127970;', bg: 'bg-blue-50' },
          { title: 'Theme', sub: 'colors', icon: '&#127912;', bg: 'bg-purple-50', dots: [settings.primary_color, settings.accent_color, settings.button_color] },
          { title: 'SMTP', sub: smtpOk ? settings.smtp_host : 'Not configured', icon: '&#128231;', bg: smtpOk ? 'bg-emerald-50' : 'bg-amber-50', ok: smtpOk },
          { title: 'Users', sub: `${userCounts.total} registered`, icon: '&#128101;', bg: 'bg-emerald-50', link: '/users' },
        ].map((c, i) => (
          <Link to={c.link || '/settings'} key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group">
            <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center text-lg`} dangerouslySetInnerHTML={{ __html: c.icon }} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider">{c.title}</p>
              {c.dots ? (
                <div className="flex gap-1 mt-1">{c.dots.map((cl, j) => <span key={j} className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ background: cl }} />)}</div>
              ) : (
                <p className={`text-sm font-medium truncate ${c.ok === false ? 'text-amber-500' : 'text-gray-700'}`}>{c.sub}</p>
              )}
            </div>
            <span className="text-gray-300 group-hover:text-gray-400 transition">&#8250;</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4 hover:shadow-sm transition">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg}`} dangerouslySetInnerHTML={{ __html: s.icon }} />
            <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        {/* Server Health */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Server Health</h2>
          <div className="space-y-5">
            {metrics.map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500">{m.name}</span>
                  <span className="font-semibold text-gray-700">{m.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${m.value > 50 ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">User Distribution</h2>
          <div className="space-y-4">
            {distItems.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                <span className="text-sm text-gray-500 flex-1">{d.label}</span>
                <span className="text-lg font-bold text-gray-800">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">System Logs</h2>
        <div className="space-y-2">
          {logs.map((l, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-gray-50">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${lvlStyle[l.lvl]}`}>{l.lvl}</span>
              <span className="flex-1 text-sm text-gray-600">{l.msg}</span>
              <span className="text-xs text-gray-300 whitespace-nowrap">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeveloperDashboard;
