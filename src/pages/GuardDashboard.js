import React from 'react';
import { useAuth } from '../context/AuthContext';

function GuardDashboard() {
  const { profile } = useAuth();
  const stats = [
    { label: "Today's Shifts", value: '2', icon: '&#128337;', bg: 'bg-blue-50 text-blue-500' },
    { label: 'Hours This Week', value: '38', icon: '&#9201;', bg: 'bg-emerald-50 text-emerald-500' },
    { label: 'Upcoming Leaves', value: '1', icon: '&#128197;', bg: 'bg-amber-50 text-amber-500' },
    { label: 'Attendance', value: '96%', icon: '&#9989;', bg: 'bg-purple-50 text-purple-500' },
  ];

  const today = [
    { shift: 'Morning Shift', time: '6:00 AM - 2:00 PM', zone: 'Main Gate', done: true },
    { shift: 'Evening Shift', time: '2:00 PM - 10:00 PM', zone: 'Zone A - Perimeter', done: false },
  ];

  const week = [
    { day: 'Saturday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Sunday', shift: 'Evening', time: '2:00 PM - 10:00 PM', zone: 'Zone A' },
    { day: 'Monday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Parking' },
    { day: 'Tuesday', shift: 'Night', time: '10:00 PM - 6:00 AM', zone: 'Lobby' },
    { day: 'Wednesday', shift: 'Off', time: '-', zone: '-' },
    { day: 'Thursday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Friday', shift: 'Off', time: '-', zone: '-' },
  ];

  const checkpoints = [
    { name: 'Gate A - Main Entrance', time: '2:15 PM', done: true },
    { name: 'Parking Level 1', time: '2:35 PM', done: true },
    { name: 'Building Lobby', time: '2:55 PM', done: true },
    { name: 'Fire Exit - North', time: '3:15 PM', done: false },
    { name: 'Rooftop Access', time: '3:35 PM', done: false },
    { name: 'Parking Level 2', time: '3:55 PM', done: false },
  ];

  const announcements = [
    { title: 'Uniform Inspection - April 10', msg: 'All guards must report in full uniform for quarterly inspection.', date: 'Apr 1' },
    { title: 'Salary Disbursement', msg: 'March salary will be credited by April 5.', date: 'Mar 30' },
    { title: 'Training Session', msg: 'Fire safety training scheduled for April 12.', date: 'Mar 28' },
  ];

  const shiftBadge = { Morning: 'bg-amber-50 text-amber-600', Evening: 'bg-blue-50 text-blue-600', Night: 'bg-purple-50 text-purple-600', Off: 'bg-gray-100 text-gray-400' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">{profile?.full_name || 'Guard'}</span>
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
        <div className="lg:col-span-3 space-y-5">
          {/* Today */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {today.map((t, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${t.done ? 'bg-gray-50 border-gray-300' : 'bg-emerald-50/50 border-emerald-500'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-gray-700">{t.shift}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.done ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>{t.done ? 'Completed' : 'In Progress'}</span>
                  </div>
                  <p className="text-xs text-gray-400">{t.time} &middot; {t.zone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3">Day</th><th className="pb-3">Shift</th><th className="pb-3">Time</th><th className="pb-3">Zone</th>
                </tr></thead>
                <tbody>
                  {week.map((w, i) => (
                    <tr key={i} className={`border-b border-gray-50 last:border-0 ${w.shift === 'Off' ? 'opacity-40' : ''}`}>
                      <td className="py-2.5 font-medium text-gray-600">{w.day}</td>
                      <td className="py-2.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${shiftBadge[w.shift]}`}>{w.shift}</span></td>
                      <td className="py-2.5 text-gray-500">{w.time}</td>
                      <td className="py-2.5 text-gray-500">{w.zone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* Checkpoints */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Patrol Checkpoints</h2>
            <div className="space-y-2">
              {checkpoints.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${c.done ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  <span className="text-base">{c.done ? '&#9989;' : '&#9723;'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">Due: {c.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Announcements</h2>
            <div className="space-y-3">
              {announcements.map((a, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                  <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap mt-0.5">{a.date}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardDashboard;
